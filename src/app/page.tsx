export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Spanish IEP PDF Renderer</h1>
      <p>POST JSON to <code>/api/render-iep</code> to generate a PDF.</p>
      <p>Add <code>?debug=html</code> to get raw HTML instead of PDF.</p>
    </main>
  );
}
