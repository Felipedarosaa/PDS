// Seleção de elementos do DOM - Autenticação
const loginTabEl = document.getElementById('login-tab');
const registerTabEl = document.getElementById('register-tab');
const loginFormEl = document.getElementById('login-form');
const registerFormEl = document.getElementById('register-form');
const loginErrorEl = document.getElementById('login-error');
const registerErrorEl = document.getElementById('register-error');
const authContainerEl = document.getElementById('auth-container');
const periodSelectorEl = document.getElementById('period-selector');
const logoutBtnEl = document.getElementById('logout-btn');

// Seleção de elementos do DOM - Seleção de período
const yearSelectEl = document.getElementById('year-select');
const monthSelectEl = document.getElementById('month-select');
const viewTransactionsBtn = document.getElementById('view-transactions');

// Alternar entre as abas de login e registro
loginTabEl.addEventListener('click', () => {
    loginTabEl.classList.add('active');
    registerTabEl.classList.remove('active');
    loginFormEl.style.display = 'block';
    registerFormEl.style.display = 'none';
});

registerTabEl.addEventListener('click', () => {
    registerTabEl.classList.add('active');
    loginTabEl.classList.remove('active');
    registerFormEl.style.display = 'block';
    loginFormEl.style.display = 'none';
});

// Função para mostrar mensagem de erro
function showError(element, message) {
    element.textContent = message;
    setTimeout(() => {
        element.textContent = '';
    }, 5000);
}

// Manipular envio do formulário de login
loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // Mostrar indicador de carregamento
        const submitBtn = loginFormEl.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;
        
        // Fazer login com email e senha
        await auth.signInWithEmailAndPassword(email, password);
        console.log('Login bem-sucedido');
        
        // Mostrar seletor de período e esconder formulário de autenticação
        authContainerEl.style.display = 'none';
        periodSelectorEl.style.display = 'block';
        
        // Resetar formulário
        loginFormEl.reset();
    } catch (error) {
        console.error('Erro no login:', error);
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Usuário não encontrado. Verifique o email ou registre-se.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Senha incorreta. Verifique e tente novamente.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Verifique o formato do email.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente mais tarde ou redefina sua senha.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'Esta conta foi desativada. Entre em contato com o suporte.';
        }
        
        showError(loginErrorEl, errorMessage);
        // Exibir o erro no console para depuração
        console.log('Código do erro:', error.code);
        console.log('Mensagem do erro:', error.message);
    } finally {
        // Restaurar botão
        const submitBtn = loginFormEl.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Entrar';
        submitBtn.disabled = false;
    }
});

// Manipular envio do formulário de registro
registerFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Verificar se as senhas coincidem
    if (password !== confirmPassword) {
        showError(registerErrorEl, 'As senhas não coincidem.');
        return;
    }
    
    try {
        // Mostrar indicador de carregamento
        const submitBtn = registerFormEl.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registrando...';
        submitBtn.disabled = true;
        
        // Criar usuário com email e senha
        await auth.createUserWithEmailAndPassword(email, password);
        console.log('Registro bem-sucedido');
        
        // Mostrar seletor de período e esconder formulário de autenticação
        authContainerEl.style.display = 'none';
        periodSelectorEl.style.display = 'block';
        
        // Resetar formulário
        registerFormEl.reset();
    } catch (error) {
        console.error('Erro no registro:', error);
        let errorMessage = 'Erro ao registrar. Tente novamente.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está em uso.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
        }
        
        showError(registerErrorEl, errorMessage);
    } finally {
        // Restaurar botão
        const submitBtn = registerFormEl.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Registrar';
        submitBtn.disabled = false;
    }
});

// Manipular logout
logoutBtnEl.addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log('Logout bem-sucedido');
        
        // Mostrar formulário de autenticação e esconder seletor de período
        authContainerEl.style.display = 'block';
        periodSelectorEl.style.display = 'none';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    }
});

// Verificar estado de autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('Usuário autenticado:', user.uid);
            authContainerEl.style.display = 'none';
            periodSelectorEl.style.display = 'block';
        } else {
            console.log('Nenhum usuário autenticado');
            authContainerEl.style.display = 'block';
            periodSelectorEl.style.display = 'none';
        }
    });
});

// Carregar anos disponíveis (do ano atual até 5 anos atrás)
function loadYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelectEl.appendChild(option);
    }
}

// Definir mês e ano atuais como seleção padrão
function setDefaultDate() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    yearSelectEl.value = currentYear;
    monthSelectEl.value = currentMonth;
}

// Event listener para o botão de visualizar transações
viewTransactionsBtn.addEventListener('click', function() {
    const selectedYear = yearSelectEl.value;
    const selectedMonth = monthSelectEl.value;
    
    // Redirecionar para a página principal com parâmetros de ano e mês
    window.location.href = `index.html?year=${selectedYear}&month=${selectedMonth}`;
});

// Inicializar
loadYears();
setDefaultDate();


// Adicionar botão de login com Google no HTML
// Adicionar esta função no welcome.js

// Função para login com Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  // Opcional: solicitar acesso ao perfil do usuário
  provider.addScope('profile');
  provider.addScope('email');
  
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log('Login com Google bem-sucedido');
      // Esconder formulário de autenticação e mostrar seletor de período
      authContainerEl.style.display = 'none';
      periodSelectorEl.style.display = 'block';
    })
    .catch((error) => {
      console.error('Erro no login com Google:', error);
      let errorMessage = 'Erro ao fazer login com Google. Tente novamente.';
      showError(loginErrorEl, errorMessage);
    });
}