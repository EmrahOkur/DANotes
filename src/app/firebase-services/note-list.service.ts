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
  orderBy,
  query,
  limit,
  where,
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteListService implements OnDestroy {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarekdNotes: Note[] = [];

  unsubTrash: Unsubscribe;
  unsubNotes: Unsubscribe;
  unsubMarkedNotes: Unsubscribe;
  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subMarkedNoteList();
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
    this.unsubMarkedNotes();
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
    const q = query(this.getNotesRef(), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = []; // Vorhandene Notizen leeren
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id)); // Notiz hinzufügen
      });
      list.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('New Note: ', change.doc.data());
        }
        if (change.type === 'modified') {
          console.log('Modified Note: ', change.doc.data());
        }
        if (change.type === 'removed') {
          console.log('Removed Note: ', change.doc.data());
        }
      });
    });
  }

  subMarkedNoteList() {
    const q = query(this.getNotesRef(), where('marked', '==', true), limit(4));
    return onSnapshot(q, (list) => {
      this.normalMarekdNotes = []; // Vorhandene Notizen leeren
      list.forEach((element) => {
        const note = this.setNoteObject(element.data(), element.id);
        this.normalMarekdNotes.push(note); // Notiz hinzufügen
      });
      console.log(this.normalMarekdNotes); // Ausgabe der Notizen
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
