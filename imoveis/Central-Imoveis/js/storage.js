const DB_KEY = "imobiflow_db";

const Storage = {
  init() {
    if (!localStorage.getItem(DB_KEY)) {
      const initialData = {
        usuarios: [
          {
            id: 1,
            nome: "Anderson Corretagem",
            role: "corretor",
            whatsapp: "5564984533465",
          },
        ],
        currentUser: null,
        imoveis: [],
        clientes: [],
        visitas: [],
      };
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    }
  },

  getData() {
    return JSON.parse(localStorage.getItem(DB_KEY));
  },

  save(key, item) {
    const db = this.getData();
    item.id = Date.now();
    db[key].push(item);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return item;
  },

  update(key, id, updatedData) {
    const db = this.getData();
    const index = db[key].findIndex((i) => i.id === id);
    if (index !== -1) {
      db[key][index] = { ...db[key][index], ...updatedData };
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
  },

  delete(key, id) {
    const db = this.getData();
    db[key] = db[key].filter((i) => i.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },

  setCurrentUser(user) {
    const db = this.getData();
    db.currentUser = user;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },
};

Storage.init();
