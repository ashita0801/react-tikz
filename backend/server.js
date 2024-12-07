const express = require("express");
const cors = require('cors');
const util = require('util');  // Add this line at the top
const fs = require("fs").promises;
const exec = util.promisify(require('child_process').exec);
const { promisify } = require("util");
const execAsync = promisify(exec);
const path = require("path");
const os = require("os");
require('dotenv').config();
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

async function createTempFile(content, extension) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tikz-'));
  const fileName = path.join(tmpDir, `diagram.${extension}`);
  await fs.writeFile(fileName, content);
  return { fileName, tmpDir };
}

async function cleanupFiles(tmpDir) {
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up:', error);
  }
}

const tikzTemplate = (tikzCode) => `\\documentclass[crop,tikz]{standalone}
\\usepackage{tikz}
\\usepackage{tikz-cd}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usetikzlibrary{arrows,shapes,positioning,calc,math}
\\begin{document}
\\begin{tikzpicture}
${tikzCode}
\\end{tikzpicture}
\\end{document}
`;

app.post('/render-tikz', async (req, res) => {
    const { tikzCode } = req.body;
    const tmpDir = path.join(__dirname, 'tmp');
    const timestamp = Date.now();
    const texFile = path.join(tmpDir, `diagram-${timestamp}.tex`);
    
    try {
        // Ensure tmp directory exists
        await fs.mkdir(tmpDir, { recursive: true });
        
        // Write the TEX file
        await fs.writeFile(texFile, tikzCode, 'utf8');
        
        // Run pdflatex
        const { stdout, stderr } = await exec(
            `pdflatex -interaction=nonstopmode -halt-on-error -output-directory="${tmpDir}" "${texFile}"`,
            { cwd: tmpDir }
        );

        // Get the PDF file path
        const pdfFile = texFile.replace('.tex', '.pdf');
        
        // Convert PDF to SVG
        const svgFile = texFile.replace('.tex', '.svg');
        await exec(`pdf2svg "${pdfFile}" "${svgFile}"`);
        
        // Read the SVG file
        const svgContent = await fs.readFile(svgFile, 'utf8');
        
        // Clean up temporary files
        await Promise.all([
            fs.unlink(texFile),
            fs.unlink(pdfFile),
            fs.unlink(svgFile),
            fs.unlink(texFile.replace('.tex', '.aux')),
            fs.unlink(texFile.replace('.tex', '.log'))
        ].map(p => p.catch(() => {})));  // Ignore errors in cleanup

        res.send(svgContent);
        
    } catch (error) {
        console.error('Error processing TikZ:', error);
        res.status(500).send(`Error processing TikZ: ${error.message}`);
    }
});

// Validate OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || apiKey === 'your_openai_api_key_here' || !apiKey.startsWith('sk-')) {
    console.error('Invalid or missing OpenAI API key. Please set a valid API key in .env file.');
    process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: apiKey
});

// Generate TikZ code using OpenAI
app.post('/generate-tikz', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'No prompt provided' });
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",  // Using GPT-4 for better LaTeX generation
            max_tokens: 2000,
            messages: [
                { 
                    role: "system", 
                    content: `You are a LaTeX expert specializing in TikZ flowcharts. Generate a complete, compilable LaTeX document with TikZ code for flowcharts. 

For any given text description, create a logical flowchart that represents the described process or concept. Follow these rules:
1. Use the exact template structure provided below
2. Include all packages in the preamble
3. Use proper TikZ syntax for nodes and arrows
4. Ensure the flowchart is logically connected
5. Add comments to explain the flowchart structure

Template:
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{tikz}
\\usetikzlibrary{shapes.geometric, arrows, positioning, calc}
\\begin{document}
\\pagestyle{empty}

% Define styles for flowchart elements
\\tikzstyle{startstop} = [rectangle, rounded corners, minimum width=3cm, minimum height=1cm, text centered, draw=black, fill=gray!10]
\\tikzstyle{process} = [rectangle, minimum width=3cm, minimum height=1cm, text centered, draw=black]
\\tikzstyle{decision} = [diamond, aspect=2, minimum width=3cm, minimum height=1cm, text centered, draw=black]
\\tikzstyle{arrow} = [thick,->,>=stealth]

\\begin{tikzpicture}[node distance=2cm, auto]
% Your flowchart here
\\end{tikzpicture}
\\end{document}` 
                },
                { 
                    role: "user", 
                    content: `Create a TikZ flowchart for: ${prompt}` 
                }
            ],
            temperature: 0.7,
        });

        // Extract TikZ code from response
        const tikzCode = completion.choices[0].message.content.trim();
        console.log('Generated TikZ code:', tikzCode);
        
        // Verify the response contains required LaTeX elements
        if (!tikzCode.includes('\\documentclass') || !tikzCode.includes('\\begin{tikzpicture}')) {
            throw new Error('Invalid TikZ code generated');
        }
        
        res.json({ tikzCode });
        
    } catch (error) {
        console.error('Error generating TikZ code:', error);
        res.status(500).json({ error: 'Failed to generate TikZ code' });
    }
});

// Generate PDF from TikZ code
app.post('/generate-pdf', async (req, res) => {
    const { tikzCode } = req.body;
    
    if (!tikzCode) {
        return res.status(400).json({ error: 'No TikZ code provided' });
    }

    try {
        // Ensure the temp directory exists and is empty
        const tempDir = 'temp';
        await fs.ensureDir(tempDir);
        // Clean up old files
        const files = await fs.readdir(tempDir);
        await Promise.all(
            files.map(file => fs.remove(`${tempDir}/${file}`))
        );
        // Directory already ensured by fs.ensureDir above
        
        const tempFilePath = `${tempDir}/flowchart_${Date.now()}`;
        fs.writeFileSync(`${tempFilePath}.tex`, tikzCode);

        // Compile LaTeX to PDF
        await new Promise((resolve, reject) => {
            exec(`pdflatex -interaction=nonstopmode -output-directory ${tempDir} ${tempFilePath}.tex`, (error, stdout, stderr) => {
                console.log('LaTeX compilation output:', stdout);
                if (error) {
                    console.error('LaTeX compilation error:', stderr);
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        // Send the PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=flowchart.pdf');
        const pdfStream = fs.createReadStream(`${tempFilePath}.pdf`);
        pdfStream.pipe(res);

        // Clean up temporary files
        pdfStream.on('end', () => {
            fs.unlinkSync(`${tempFilePath}.tex`);
            fs.unlinkSync(`${tempFilePath}.pdf`);
            // Clean up auxiliary files
            ['aux', 'log'].forEach(ext => {
                const auxFile = `${tempFilePath}.${ext}`;
                if (fs.existsSync(auxFile)) {
                    try {
                        fs.unlinkSync(auxFile);
                    } catch (error) {
                        console.warn(`Warning: Could not delete auxiliary file ${auxFile}:`, error.message);
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});