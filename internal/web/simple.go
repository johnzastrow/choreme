package web

import (
	"embed"
	"html/template"
	"net/http"
)

//go:embed templates/*.html
var templatesFS embed.FS

// Simple HTML templates approach (no React required)
type SimpleUI struct {
	templates *template.Template
}

// NewSimpleUI creates a simple HTML-based UI
func NewSimpleUI() (*SimpleUI, error) {
	tmpl, err := template.ParseFS(templatesFS, "templates/*.html")
	if err != nil {
		return nil, err
	}

	return &SimpleUI{
		templates: tmpl,
	}, nil
}

// ServeHomePage serves the main page
func (ui *SimpleUI) ServeHomePage(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title   string
		Message string
	}{
		Title:   "ChoreMe - Family Chore Manager",
		Message: "Welcome to ChoreMe!",
	}

	w.Header().Set("Content-Type", "text/html")
	ui.templates.ExecuteTemplate(w, "home.html", data)
}

// ServeLoginPage serves the login page
func (ui *SimpleUI) ServeLoginPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	ui.templates.ExecuteTemplate(w, "login.html", nil)
}