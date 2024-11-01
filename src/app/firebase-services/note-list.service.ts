import { Injectable, inject, OnDestroy } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  Unsubscribe,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteListService implements OnDestroy {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  unsubTrash: Unsubscribe;
  unsubNotes: Unsubscribe;
  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNoteList();
  }

  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }
  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJason(note)).catch((err) => {
        console.log(err);
      });
    }
  }

  getCleanJason(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }
  async addNote(item: Note, colId: 'notes' | 'trash') {
    try {
      // Erhalte die Sammlungsreferenz basierend auf `colId`
      const collectionRef = collection(this.firestore, colId);
      // Füge die Notiz zur angegebenen Sammlung hinzu
      const docRef = await addDoc(collectionRef, item);
      console.log('Document written with ID:', docRef.id);
    } catch (err) {
      console.error('Error adding document:', err);
    }
  }

  ngOnDestroy() {
    if (this.unsubTrash) {
      this.unsubTrash();
    }
    if (this.unsubNotes) {
      this.unsubNotes();
    }
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (snapshot) => {
      this.trashNotes = []; // Vorhandene Notizen leeren
      snapshot.forEach((doc) => {
        const note = this.setNoteObject(doc.data(), doc.id);
        this.trashNotes.push(note); // Notiz hinzufügen
      });
      console.log(this.trashNotes); // Ausgabe der Notizen
    });
  }

  subNoteList() {
    return onSnapshot(this.getNotesRef(), (snapshot) => {
      this.normalNotes = []; // Vorhandene Notizen leeren
      snapshot.forEach((doc) => {
        const note = this.setNoteObject(doc.data(), doc.id);
        this.normalNotes.push(note); // Notiz hinzufügen
      });
      console.log(this.normalNotes); // Ausgabe der Notizen
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
