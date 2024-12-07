import React, { useState } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import TikzPreviewer from "./TikzPreviewer";
import "./ComponentStyles.css";

const FlowchartGenerator = () => {
    const [input, setInput] = useState("");
    const [tikzCode, setTikzCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!input.trim()) {
            setError("Please enter a description for the flowchart");
            return;
        }

        setLoading(true);
        setError(null);
        setTikzCode("");

        try {
            const response = await axios.post("http://localhost:5000/generate-tikz", {
                prompt: `Generate a TikZ code for the following flowchart: ${input}`,
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            setTikzCode(response.data.tikzCode);
        } catch (err) {
            setError("Failed to generate flowchart: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!tikzCode) {
            setError("No flowchart to download");
            return;
        }
        
        try {
            const response = await axios.post(
                "http://localhost:5000/generate-pdf",
                { tikzCode },
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'flowchart.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError("Failed to download PDF: " + err.message);
        }
    };

    return (
        <div className="generator-section">
            <h2 className="section-title">Generate Your Flowchart</h2>
            <div className="input-area">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the flowchart you want to create..."
                    className="input-area-textarea"
                />
            </div>
            <div className="button-group">
                <button 
                    className="action-button"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Flowchart'}
                    {loading && <span className="loading">↻</span>}
                </button>
                {tikzCode && (
                    <button
                        className="action-button"
                        onClick={handleDownload}
                    >
                        Download PDF
                    </button>
                )}
            </div>
            {error && <p className="error">{error}</p>}
            {tikzCode && (
                <div className="preview-area">
                    <h3 className="text-lg font-semibold mb-3">Preview</h3>
                    <TikzPreviewer tikzCode={tikzCode} />
                </div>
            )}
        </div>
    );
};

FlowchartGenerator.propTypes = {
    onGenerate: PropTypes.func,
};

export default FlowchartGenerator;