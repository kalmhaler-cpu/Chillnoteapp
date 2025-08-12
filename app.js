import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ImageBackground, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_KEY = "@my_notes";

export default function App() {
  const [notes, setNotes] = useState({});
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [selectedTitle, setSelectedTitle] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
      if (jsonValue != null) setNotes(JSON.parse(jsonValue));
    } catch (e) {
      console.error("Failed to load notes", e);
    }
  }

  async function saveNotes(newNotes) {
    try {
      const jsonValue = JSON.stringify(newNotes);
      await AsyncStorage.setItem(NOTES_KEY, jsonValue);
      setNotes(newNotes);
    } catch (e) {
      console.error("Failed to save notes", e);
    }
  }

  function addNote() {
    if (!titleInput.trim()) {
      Alert.alert("Error", "Please enter a note title");
      return;
    }
    if (notes[titleInput]) {
      Alert.alert("Error", "Note with this title already exists");
      return;
    }
    const newNotes = { ...notes, [titleInput]: contentInput };
    saveNotes(newNotes);
    setTitleInput("");
    setContentInput("");
    setSelectedTitle(null);
  }

  function updateNote() {
    if (!selectedTitle) return;
    const newNotes = { ...notes, [selectedTitle]: contentInput };
    saveNotes(newNotes);
  }

  function deleteNote(title) {
    Alert.alert("Confirm Delete", `Delete note "${title}"?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          const newNotes = { ...notes };
          delete newNotes[title];
          saveNotes(newNotes);
          if (selectedTitle === title) {
            setSelectedTitle(null);
            setTitleInput("");
            setContentInput("");
          }
        },
        style: "destructive",
      },
    ]);
  }

  function selectNote(title) {
    setSelectedTitle(title);
    setTitleInput(title);
    setContentInput(notes[title]);
  }

  return (
    <ImageBackground
      source={{uri: "https://images.unsplash.com/photo-1516116216624-53e697fedbe2?auto=format&fit=crop&w=600&q=80"}}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Chill Notes ❄️</Text>
        <FlatList
          style={styles.list}
          data={Object.keys(notes)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectNote(item)}
              style={[styles.listItem, selectedTitle === item && styles.selectedItem]}
            >
              <Text style={styles.listItemText}>{item}</Text>
              <TouchableOpacity onPress={() => deleteNote(item)}>
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />

        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          value={titleInput}
          onChangeText={setTitleInput}
          editable={!selectedTitle} // can't edit title of existing note
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Note Content"
          value={contentInput}
          onChangeText={setContentInput}
          multiline
        />

        <View style={styles.buttons}>
          {!selectedTitle ? (
            <TouchableOpacity style={[styles.button, styles.addButton]} onPress={addNote}>
              <Text style={styles.buttonText}>Add Note</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={updateNote}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={() => {
              setSelectedTitle(null);
              setTitleInput("");
              setContentInput("");
            }}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    paddingTop: 40,
  },
  container: {
    flex: 1,
    marginHorizontal: 15,
    backgroundColor: "rgba(242, 205, 224, 0.7)", // pastel pink with transparency
    borderRadius: 20,
    padding: 15,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 10,
    textAlign: "center",
  },
  list: {
    maxHeight: 200,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fce4ec",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0b1cb",
  },
  selectedItem: {
    backgroundColor: "#81ecec",
  },
  listItemText: {
    fontSize: 16,
    color: "#2d3436",
  },
  deleteText: {
    fontSize: 18,
    color: "#d63031",
  },
  titleInput: {
    height: 40,
    backgroundColor: "#f8cdda",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#2d3436",
    marginBottom: 10,
  },
  contentInput: {
    flex: 1,
    backgroundColor: "#d4f1f4",
    borderRadius: 15,
    padding: 10,
    fontSize: 16,
    color: "#2d3436",
    textAlignVertical: "top",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addButton: {
    backgroundColor: "#6c5ce7",
  },
  editButton: {
    backgroundColor: "#00cec9",
  },
  clearButton: {
    backgroundColor: "#fd79a8",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
