# Components Documentation

## FlowchartGenerator

The main component that handles user input and generates flowcharts using TikZ code. Features include:

- Input validation and error handling
- Loading states with animated indicators
- Proper cleanup of resources
- Responsive design using Tailwind CSS
- PDF download functionality

## TikzPreviewer

A memoized component that renders TikZ code using KaTeX. Features include:

- Live preview of generated TikZ code
- Prop type validation
- Performance optimization through React.memo
- Consistent styling using Tailwind CSS

## Best Practices Used

1. **Error Handling**
   - Input validation
   - User-friendly error messages
   - Proper error state management

2. **Performance**
   - Memoization of components
   - Cleanup of resources
   - Optimized re-renders

3. **Documentation**
   - JSDoc comments
   - PropTypes validation
   - Comprehensive README

4. **UI/UX**
   - Loading states
   - Responsive design
   - Consistent styling
   - Clear user feedback