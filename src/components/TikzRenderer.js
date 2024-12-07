import React, { useEffect, useState } from "react";

const TikzRenderer = ({ tikzCode }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderTikz = async () => {
      if (!tikzCode) return;

      try {
        const response = await fetch('http://localhost:5000/render-tikz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tikzCode }),
        });

        if (!response.ok) {
          // Get the error message from the response
          const errorMessage = await response.text();
          // If it's a LaTeX error, format it for better readability
          if (errorMessage.includes('LaTeX compilation failed:')) {
            throw new Error(errorMessage.replace(/\\n/g, '\n'));
          } else {
            throw new Error(errorMessage || 'Failed to render TikZ');
          }
        }

        const svgData = await response.text();
        setSvgContent(svgData);
      } catch (error) {
        console.error('Error rendering TikZ:', error);
        if (error.message === "Failed to fetch") {
          setError("Could not connect to the rendering server. Make sure the server is running on port 5000 and has LaTeX and pdf2svg installed.");
        } else {
          setError(error.message);
        }
        setSvgContent(null);
      }
    };

    renderTikz();
  }, [tikzCode]);

  if (!tikzCode) return null;
  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded">
        {error}
      </div>
    );
  }
  if (!svgContent) {
    return (
      <div className="text-gray-600 p-4 border border-gray-200 rounded">
        Rendering TikZ diagram... (Make sure LaTeX and pdf2svg are installed on the server)
      </div>
    );
  }

  return (
    <div>
      <div 
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      />
    </div>
  );
};

export default TikzRenderer;
