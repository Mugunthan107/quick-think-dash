/**
 * GradientBg — renders soft ambient gradient blobs behind page content.
 * Usage: wrap page with <div className="page-bg"><GradientBg /><div className="page-content">...</div></div>
 */
const GradientBg = () => (
    <>
        {/* Fixed blob top-right (cyan) */}
        <div className="blob-top-right" />
        {/* Center soft purple glow */}
        <div className="blob-center" />
    </>
);

export default GradientBg;
