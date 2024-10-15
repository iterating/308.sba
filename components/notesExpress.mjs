const pastebinAPI = "l6ccuOpobsa5IisYMP37Epqsb9kP2ZuK";
const savedNotes = document.getElementById("saved-notes");

export async function saveNote() {
  const content = document.getElementById("note-content")?.value;
  const noteTitle = document.getElementById("note-title")?.value;
  if (!content || !noteTitle) {
    console.error("Error: Missing note title or content");
    return;
  }
  try {
    const response = await axios.get("/notes", {
      api_paste_name: noteTitle,
      api_paste_code: content,
    });
    if (!response || !response.data) {
      console.error("Error: Missing response data");
      return;
    }
    document.getElementById("animematch").innerHTML = `Note saved: <a href="${response.data.url}" target="_blank">${response.data.url}</a>`;
    localStorage.setItem("api-user-key", userKey);
    fetchNotes();
  } catch (error) {
    console.error("Error:", error);
    localStorage.setItem("lastNote", JSON.stringify({
      title: noteTitle,
      content: content,
    }));
  }
}

document.getElementById("save-note").addEventListener("click", saveNote);

export async function fetchNotes() {
  try {
    const response = await axios.get("/favorites");
    if (!response || !response.data) {
      console.error("Error: Missing response data");
      return;
    }

    savedNotes.innerHTML = ""; // Clear previous notes
    
    if (!savedNotes.firstChild) {
      const lastNote = JSON.parse(localStorage.getItem("lastNote"));
      if (lastNote) {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${lastNote.url}" target="_blank">${lastNote.title}</a>`;
        savedNotes.appendChild(listItem);
      }
    }

    if (response.data.length > 0) {
      response.data.forEach((note) => {
        if (!note || !note.url || !note.title) {
          console.error("Error: Missing note data");
          return;
        }
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${note.url}" target="_blank">${note.title}</a>`;
        savedNotes.appendChild(listItem);
      });
    }
  } catch (error) {
    console.error("Error:", error);
    
    const lastNote = localStorage.getItem("lastNote");
    if (lastNote) {
      try {
        const note = JSON.parse(lastNote);
        if (note && note.title && note.content) {
          const listItem = document.createElement("li");
          listItem.innerHTML = `<a href="" target="_blank">${note.title}</a>`;
          savedNotes.appendChild(listItem);
        } 
      } catch (error) {
        console.error("Error: Could not parse last note data:", error);
      }
    }
  }
}

