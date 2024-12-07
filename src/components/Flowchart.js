import React from "react";
import TikzRenderer from "./TikzRenderer";
import "./ComponentStyles.css";

const Flowchart = () => {
    const tikzCode = `
    \\documentclass{article}
    \\usepackage{tikz}
    \\usetikzlibrary{shapes.geometric, arrows, positioning}
    
    \\tikzstyle{phase} = [rectangle, rounded corners, minimum width=3cm, minimum height=1cm, text centered, draw=black, fill=blue!20]
    \\tikzstyle{decision} = [diamond, aspect=2, minimum width=3cm, minimum height=1cm, text centered, draw=black, fill=yellow!20]
    \\tikzstyle{artifact} = [rectangle, minimum width=2.5cm, minimum height=0.8cm, text centered, draw=black, fill=green!20]
    \\tikzstyle{annotation} = [rectangle, dashed, minimum width=2.5cm, text width=2.5cm, minimum height=0.8cm, text centered, draw=black]
    \\tikzstyle{arrow} = [thick,->,>=stealth]
    
    \\begin{document}
    \\begin{tikzpicture}[node distance=2cm]
    
    % Sprint Planning Phase
    \\node (planning) [phase] {Sprint Planning};
    \\node (backlog) [artifact, right=1.5cm of planning] {Product Backlog};
    \\node (plan-note) [annotation, left=1.5cm of planning] {2-4 Hour Meeting\\\\Sprint Goals\\\\Task Estimation};
    
    % Development Phase
    \\node (development) [phase, below=of planning] {Development};
    \\node (dev-artifacts) [artifact, right=1.5cm of development] {Code\\\\Unit Tests};
    \\node (dev-note) [annotation, left=1.5cm of development] {Daily Standups\\\\Pair Programming\\\\Code Reviews};
    
    % Testing Phase
    \\node (testing) [decision, below=of development] {Testing & QA};
    \\node (test-artifacts) [artifact, right=1.5cm of testing] {Test Reports};
    \\node (test-note) [annotation, left=1.5cm of testing] {Integration Tests\\\\User Testing\\\\Bug Fixes};
    
    % Review & Retro Phase
    \\node (review) [phase, below=of testing] {Sprint Review};
    \\node (retro) [phase, below=of review] {Retrospective};
    
    % Connecting arrows
    \\draw [arrow] (planning) -- (development);
    \\draw [arrow] (development) -- (testing);
    \\draw [arrow] (testing) -- (review);
    \\draw [arrow] (review) -- (retro);
    \\draw [arrow] (retro.west) to [bend left=45] (planning.west);
    
    % Failure path
    \\draw [arrow] (testing.east) to [bend left=45] (development.east);
    
    \\end{tikzpicture}
    \\end{document}
    `;

    return (
        <div className="flowchart-section">
            <h2 className="section-title">Sample Agile Sprint Flowchart</h2>
            <div className="preview-area">
                <TikzRenderer tikzCode={tikzCode} />
            </div>
        </div>
    );
};

export default Flowchart;