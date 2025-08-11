package web

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed build
var buildFS embed.FS

// GetFileSystem returns the embedded web build filesystem
func GetFileSystem() (http.FileSystem, error) {
	build, err := fs.Sub(buildFS, "build")
	if err != nil {
		return nil, err
	}
	return http.FS(build), nil
}

// SPAHandler handles Single Page Application routing
type SPAHandler struct {
	staticFS http.FileSystem
	indexHTML []byte
}

// NewSPAHandler creates a new SPA handler
func NewSPAHandler() (*SPAHandler, error) {
	fs, err := GetFileSystem()
	if err != nil {
		return nil, err
	}
	
	// Read index.html for SPA fallback
	indexFile, err := fs.Open("index.html")
	if err != nil {
		return nil, err
	}
	defer indexFile.Close()
	
	indexHTML := make([]byte, 0)
	buffer := make([]byte, 1024)
	for {
		n, err := indexFile.Read(buffer)
		if n > 0 {
			indexHTML = append(indexHTML, buffer[:n]...)
		}
		if err != nil {
			break
		}
	}
	
	return &SPAHandler{
		staticFS:  fs,
		indexHTML: indexHTML,
	}, nil
}

// ServeHTTP serves the SPA files
func (h *SPAHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/")
	if path == "" {
		path = "index.html"
	}
	
	// Try to serve the static file
	if file, err := h.staticFS.Open(path); err == nil {
		file.Close()
		http.FileServer(h.staticFS).ServeHTTP(w, r)
		return
	}
	
	// Fallback to index.html for SPA routing
	w.Header().Set("Content-Type", "text/html")
	w.Write(h.indexHTML)
}