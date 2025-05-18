/**
 * Returns true if code is running in a browser environment
 * Modified to avoid hydration issues when used during rendering
 */
const canUseDOM = () => {
  // We define this as a function that returns a boolean
  // instead of a direct boolean value to avoid evaluation during module load
  return typeof window !== 'undefined' && 
         typeof window.document !== 'undefined' && 
         typeof window.document.createElement !== 'undefined'
}

export default canUseDOM
