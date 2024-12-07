import React from "react";
import FlowchartGenerator from "./components/FlowchartGenerator";
import Flowchart from "./components/Flowchart";
/**
 * App Component
 * 
 * The root component of the application that renders the main layout
 * and the FlowchartGenerator component.
 */
function App() {
    const mainStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
    };
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800">
            <header className="mb-8">
                {/* <h1 className="text-4xl font-bold text-center text-gray-900">
                    React + LLM + TikZ Flowchart Generator
                </h1>
                <p className="text-center text-gray-600 mt-2">
                    Create beautiful flowcharts using natural language
                </p> */}
            </header>
            
            <main style={mainStyle}>
                <div className="bg-white shadow-xl rounded-lg p-8 backdrop-blur-sm bg-opacity-90">
                    <div className="mb-8">
                        <FlowchartGenerator />
                    </div>
                    <div className="border-t pt-8">
                        <Flowchart />
                    </div>
                </div>
            </main>
            
            {/* <footer className="mt-12 text-center text-gray-600 text-sm py-8 border-t">
                <p>Built with React, OpenAI, and TikZ</p>
            </footer> */}
        </div>
    );
}

export default App;
