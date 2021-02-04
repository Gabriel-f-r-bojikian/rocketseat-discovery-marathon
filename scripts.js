const Modal = {
  toggle() {
    // Alternate model between active and inactive
    document
      .querySelector('.modal-overlay')
      .classList
      .toggle('active');
  },
  toggleEdit(transactionToBeDisplayed) {  
    // Alternate model between active and inactive
    document
      .querySelector('.modal-overlay-edit')
      .classList
      .toggle('active');
},

}

const transactions = [
  {
    id: 1,
    description: 'Luz',
    amount: -50000,
    date: '23/01/2021',
  },
  {
    id: 2,
    description: 'Website',
    amount: 500000,
    date: '23/01/2021',
  },
  {
    id: 3,
    description: 'Internet',
    amount: -2000,
    date: '23/01/2021',
  },
]

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
  },
}

const Transaction = {
  all: Storage.get(),
  
  add(transaction){
    Transaction.all.push(transaction)
    App.reload();
  },

  remove(index){
    Transaction.all.splice(index, 1)
    App.reload();
  },

  searchIndex(transaction) {
    for(let i = 0; i < Transaction.all.length; i++){
      if(Transaction.all[i].description === transaction.description){
        return i;
      }
    }
  },

  update(transaction) {
    const index = Transaction.searchIndex(transaction);
    Transaction.all[index] = transaction;
    App.reload();
  },

  incomes() {
    let income = 0
    Transaction.all.forEach((transaction) => {
      if(transaction.amount > 0){
        income += transaction.amount;
      }
    })
    return income;
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach((transaction) => {
      if(transaction.amount < 0){
        expense += transaction.amount;
      }
    })
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
    <td class="edit"><a href="#" onclick="Modal.toggleEdit()" class="button new">Edit</a></td>
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
    </td>
    `
    return html;
  },
  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes());
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total());
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
}

const Utils = {
  formatAmount(value){
    value = Number(value) * 100;
    return value;
  },

  formatDate(value){
    const splittedDate = value.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value){
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

    return signal + value;
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields(description, amount, date){
    if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues(description, amount, date){
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction){
    Transaction.add(transaction);
  },

  updateTransaction(transaction) {
    Transaction.update(transaction);
  },

  clearFields(){
    document.querySelector('input#description').value = "";
    document.querySelector('input#amount').value = "";
    document.querySelector('input#date').value = "";
  },

  clearEditFields(){
    document.querySelector('input#description-update').value = "";
    document.querySelector('input#amount-update').value = "";
    document.querySelector('input#date-update').value = "";
  },

  submit(event){
    event.preventDefault();

    try {
      // Verificar se informações foram preenchidas
      Form.validateFields(
        document.querySelector('input#description').value,
        document.querySelector('input#amount').value,
        document.querySelector('input#date').value
      );
      // Formatar os dados para salvar
      const transaction = Form.formatValues(
        document.querySelector('input#description').value,
        document.querySelector('input#amount').value,
        document.querySelector('input#date').value
      );
      // Salvar
      Form.saveTransaction(transaction);
      // Apagar os dados do formulário
      Form.clearFields();
      // Fechar modal
      Modal.toggle();
      // Atualizar a aplicação
      App.reload();
    } catch (error) {
      alert(error.message);
    }

  },

  update(event){
    event.preventDefault();

    try {
      // Verificar se informações foram preenchidas
      Form.validateFields(
        document.querySelector('input#description-update').value,
        document.querySelector('input#amount-update').value,
        document.querySelector('input#date-update').value
      );
      // Formatar os dados para salvar
      const transaction = Form.formatValues(
        document.querySelector('input#description-update').value,
        document.querySelector('input#amount-update').value,
        document.querySelector('input#date-update').value
      );
      // Salvar
      Form.updateTransaction(transaction);
      // Apagar os dados do formulário
      Form.clearEditFields();
      // Fechar modal
      Modal.toggleEdit();
      // Atualizar a aplicação
      App.reload();
    } catch (error) {
      alert(error.message);
    }

  },
}

let darkMode = false;

function darkModeToggleCards() {
  const cards = document.getElementsByClassName("card");
  
  cards[0].classList.toggle("dark");
  cards[1].classList.toggle("dark");
}

function darkModeToggleButtonImage() {
  if(darkMode === true) {
    document.getElementById("dark-mode-button").src = "./assets/brightness.svg";
  } else {
    document.getElementById("dark-mode-button").src = "./assets/night-mode.svg";
  }
}

function darkModeToggle() {
  if (darkMode === true) {
    darkMode = false;
  } else {
    darkMode = true;
  }
  document.body.classList.toggle("dark");
  darkModeToggleCards();
  darkModeToggleButtonImage();
}

const App = {
  init() {
    
    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init()
  },
}

App.init();