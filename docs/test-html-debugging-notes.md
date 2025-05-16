# Test HTML Debugging Notes

## Fixing the Next.js Preload Warning

### Issue

When viewing the standalone HTML test files (like `api-test.html`) in the browser, you might see this warning in the console:

```
The resource http://localhost:3000/_next/static/css/app/(frontend)/layout.css?v=xxxxxxxxxx was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
```

### Cause

This happens because the test HTML files are served from the Next.js public directory, and Next.js automatically injects preload links for its CSS resources in all pages. However, these standalone HTML files don't actually use these CSS resources, resulting in the browser warning about unused preloaded resources.

### Solution

The solution implemented in `api-test.html` adds a small JavaScript snippet that modifies any Next.js preload links by changing their `rel` attribute from "preload" to "prefetch". This prevents the browser warning while still allowing the resources to be fetched if needed.

```html
<script>
    // This script removes unused preload links to prevent browser warnings
    document.addEventListener('DOMContentLoaded', () => {
        const links = document.querySelectorAll('link[rel="preload"]');
        links.forEach(link => {
            // If it's a Next.js generated link, modify its attributes
            if (link.href.includes('_next/static/css')) {
                // Change rel from preload to prefetch to avoid the warning
                link.setAttribute('rel', 'prefetch');
            }
        });
    });
</script>
```

### Deployment Considerations

When deploying the test HTML files to a production environment, you may need to update this script to account for different URL patterns or resource locations. The key is to identify and modify any preloaded resources that aren't actually used by the standalone HTML page.

## Alternative Approaches

If you continue to experience issues with the preloaded resources, consider these alternatives:

1. **Host test files on a separate server**: This completely avoids Next.js injecting any resources into your static HTML files.

2. **Use iframes**: Embed the test pages in iframes with a sandbox attribute to isolate them from the parent document's resources.

3. **Implement a custom server middleware**: Modify responses for specific routes to remove preload links before they reach the browser.
