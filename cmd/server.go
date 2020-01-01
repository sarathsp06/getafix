package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

type request struct {
	Method    string
	URL       *url.URL
	Headers   http.Header
	TimeStamp time.Time
	Data      string
}

var requestIDLog = make(map[string][]request)

func hook(w http.ResponseWriter, r *http.Request) {
	requestID := chi.URLParam(r, "uuid")
	data, _ := ioutil.ReadAll(io.LimitReader(r.Body, 32<<10))
	reqPayload := request{
		Method:    r.Method,
		Headers:   r.Header,
		URL:       r.URL,
		Data:      string(data),
		TimeStamp: time.Now(),
	}
	requestIDLog[requestID] = append(requestIDLog[requestID], reqPayload)

	fmt.Fprintf(w, "%s", "Success")
}

func getLogs(w http.ResponseWriter, r *http.Request) {
	requestID := chi.URLParam(r, "uuid")
	if _, ok := requestIDLog[requestID]; ok {
		data, _ := json.Marshal(requestIDLog[requestID])

		// log.Println("sss ", string(data))
		requestIDLog[requestID] = nil
		fmt.Fprint(w, string(data))
		return
	}
	fmt.Fprintf(w, "%s", "Not found")
}

func createSession(w http.ResponseWriter, r *http.Request) {
	requestID := uuid.New().String()
	fmt.Fprintf(w, `{"session_id" : "%s"}`, requestID)
}

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}
	r := chi.NewRouter()

	r.Route("/sessions", func(r chi.Router) {
		r.Post("/", createSession)
		r.Get("/{uuid}/logs", getLogs)
		r.Mount("/uuid", hook)
	})

	log.Println("listening on :", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
