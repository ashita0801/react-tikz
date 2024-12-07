import React from "react";
import TikzRenderer from "./TikzRenderer";
import PropTypes from 'prop-types';
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

/**
 * TikzPreviewer Component
 * 
 * A component that renders TikZ code using KaTeX for live preview.
 * 
 * @param {Object} props
 * @param {string} props.tikzCode - The TikZ code to render
 */
const TikzPreviewer = ({ tikzCode }) => {
    if (!tikzCode) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
                <TikzRenderer tikzCode={tikzCode} />
            </div>
        </div>
    );
};

TikzPreviewer.propTypes = {
    tikzCode: PropTypes.string.isRequired,
};

export default React.memo(TikzPreviewer);
