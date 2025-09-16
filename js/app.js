// Seleção de elementos do DOM
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const transactionFormEl = document.getElementById('transaction-form');
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const dateEl = document.getElementById('date');
const notesEl = document.getElementById('notes');
const transactionListEl = document.getElementById('transaction-list');
const searchEl = document.getElementById('search');
const filterCategoryEl = document.getElementById('filter-category');
const filterTypeEl = document.getElementById('filter-type');
const filterDateStartEl = document.getElementById('filter-date-start');
const filterDateEndEl = document.getElementById('filter-date-end');
const expenseChartEl = document.getElementById('expense-chart');
const incomeExpenseChartEl = document.getElementById('income-expense-chart');
const incomeBtnEl = document.getElementById('income-btn');
const expenseBtnEl = document.getElementById('expense-btn');

// Elementos DOM para totais por categoria
let expenseCategoriesEl, incomeCategoriesEl, categoryTabs, categoryContents;

// Definir a data atual no campo de data
dateEl.valueAsDate = new Date();

// Array para armazenar transações em memória
let transactions = [];

// Funções para mostrar/esconder indicador de carregamento
function showLoadingIndicator() {
    // Criar elemento de loading se não existir
    if (!document.getElementById('loading-indicator')) {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'loading-indicator';
        loadingEl.innerHTML = '<div class="spinner"></div><p>Carregando dados...</p>';
        loadingEl.style.position = 'fixed';
        loadingEl.style.top = '0';
        loadingEl.style.left = '0';
        loadingEl.style.width = '100%';
        loadingEl.style.height = '100%';
        loadingEl.style.backgroundColor = 'rgba(255,255,255,0.8)';
        loadingEl.style.display = 'flex';
        loadingEl.style.flexDirection = 'column';
        loadingEl.style.alignItems = 'center';
        loadingEl.style.justifyContent = 'center';
        loadingEl.style.zIndex = '9999';
        
        // Estilo para o spinner
        const style = document.createElement('style');
        style.textContent = `
            .spinner {
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(loadingEl);
    } else {
        document.getElementById('loading-indicator').style.display = 'flex';
    }
}

function hideLoadingIndicator() {
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

// Função para verificar se uma data está dentro do mês e ano especificados
function isDateInPeriod(dateString, year, month) {
    // Extrair ano, mês e dia da string de data (formato YYYY-MM-DD)
    const [inputYear, inputMonth, inputDay] = dateString.split('-').map(Number);
    
    // Comparar diretamente os componentes da data
    // Lembre-se que inputMonth é 1-12, enquanto month é 0-11
    const adjustedInputMonth = inputMonth - 1;
    
    // Verificar se o ano e mês correspondem exatamente
    return (inputYear === parseInt(year) && adjustedInputMonth === parseInt(month));
}

// Função para carregar transações do Firestore
async function loadTransactionsFromFirestore() {
    try {
        showLoadingIndicator();
        
        console.log('Iniciando carregamento de dados do Firestore...');
        
        // Aguardar a inicialização completa do Firebase Auth
        await new Promise(resolve => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            });
            
            // Timeout de segurança após 3 segundos
            setTimeout(() => resolve(null), 3000);
        });
        
        // Verificar se o usuário está logado
        if (!auth.currentUser) {
            console.log('Usuário não autenticado, redirecionando para a página de login...');
            window.location.href = 'welcome.html';
            return;
        }
        
        console.log('Usuário autenticado. UID:', auth.currentUser.uid);
        
        // Buscar transações do usuário atual
        console.log('Buscando transações para o usuário:', auth.currentUser.uid);
        const userRef = db.collection('users').doc(auth.currentUser.uid);
        const transactionsRef = userRef.collection('transactions');
        const snapshot = await transactionsRef.get();
            
        console.log('Resposta do Firestore recebida. Documentos encontrados:', snapshot.size);
        
        // Limpar array de transações
        transactions = [];
        
        // Adicionar documentos ao array de transações
        snapshot.forEach(doc => {
            const transaction = {
                id: doc.id,
                ...doc.data()
            };
            transactions.push(transaction);
        });
        
        console.log('Transações carregadas com sucesso:', transactions.length);
        
        // Inicializar a interface
        init();
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Erro ao carregar dados do Firestore:', error);
        hideLoadingIndicator();
        alert('Erro ao carregar dados. Por favor, tente novamente.');
    }
}

// Definir categorias para entradas e saídas
const categories = {
    income: {
        'salario_mensal': 'Salário Mensal',
        'outros_recebimentos': 'Outros Recebimentos'
    },
    expense: {
        // Subgrupo Moradia
        'moradia': 'Moradia',
        'aluguel_parcela': 'Aluguel/Parcela',
        'condominio': 'Condomínio',
        'alarme_seguranca': 'Alarme/segurança',
        'conta_luz': 'Conta de luz',
        'conta_agua': 'Conta de água',
        'gas_agua_mineral': 'Gás/Água Mineral',
        'iptu': 'IPTU',
        'internet_moradia': 'Internet',
        'telefone_celular': 'Telefone/celular',
        'consertos_manutencao': 'Consertos/manutenção',
        
        // Subgrupo Alimentação
        'alimentacao': 'Alimentação',
        'supermercado': 'Supermercado',
        'restaurante': 'Restaurante',
        'padaria_cafe': 'Padaria/Café',
        'guilherme_c_masio': 'Guilherme C Masio',
        'delivery': 'Ifood/rappi/uber eat/outros',
        
        // Subgrupo Transporte
        'transporte': 'Transporte',
        'combustivel': 'Combustível',
        'manutencao_carro': 'Manutenção do carro',
        'pedagio': 'Pedágio',
        'estacionamento': 'Estacionamento',
        'ipva': 'IPVA',
        'uber_99': '99 e Uber',
        
        // Subgrupo Saúde
        'saude': 'Saúde',
        'plano_saude': 'Plano de saúde',
        'exames': 'Exames',
        'consultas': 'Consultas',
        'farmacia': 'Farmácia',
        'academia': 'Academia',
        
        // Subgrupo Lazer/informação
        'lazer': 'Lazer/informação',
        'assinatura_ifood_apple': 'Assinatura (Ifood, apple)',
        'assinatura_canais': 'Assinatura de canais',
        'netflix': 'Netflix e outros',
        'spotify': 'Spotify e outros',
        'programas_culturais': 'Programas culturais',
        
        // Subgrupo Consultório/Loja
        'consultorio_loja': 'Consultório/Loja',
        'aluguel_consultorio': 'Aluguel',
        'condominio_consultorio': 'Condomínio',
        'luz_consultorio': 'Luz',
        'telefone_consultorio': 'Telefone',
        'manutencao_consultorio': 'Manutenção',
        'contabilidade': 'Contabilidade',
        
        // Subgrupo Outros gastos
        'outros_gastos': 'Outros gastos',
        'internet_outros': 'Internet',
        'outros_gastos_gerais': 'Outros gastos',
        'eletrodomesticos': 'Eletrodomésticos',
        'roupas': 'Roupas',
        'otica': 'Otica',
        'racao_pet': 'Ração/Pet shop',
        'costureira': 'Costureira',
        'cartao_credito': 'Cartão de crédito',
        'debitos_bancarios': 'Débitos bancários',
        'presentes': 'Presentes',
        'imposto_renda': 'Imposto de Renda',
        'seguros': 'Seguros',
        'viajem': 'Viajem',
        'salao': 'Salão',
        'barbeiro': 'Barbeiro',
        'faculdade_cursos': 'Faculdade/cursos',
        'outras_despesas': 'Outras despesas'
    }
};

// Variável para controlar o tipo de transação atual (income ou expense)
let currentTransactionType = 'income';

// Variável para armazenar ID da transação em edição
let editingTransactionId = null;

// Verificar se há parâmetros de ano e mês na URL
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
        year: params.get('year'),
        month: params.get('month')
    };
}

// Função para carregar categorias no select baseado no tipo de transação
function loadCategories(type) {
    // Limpar select de categorias
    categoryEl.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
    
    // Adicionar categorias baseadas no tipo
    const categoryList = categories[type];
    
    // Lista de subgrupos para destacar em negrito
    const subgroups = [
        'moradia', 'alimentacao', 'transporte', 'saude', 'lazer', 
        'consultorio_loja', 'outros_gastos'
    ];
    
    for (const [value, label] of Object.entries(categoryList)) {
        const option = document.createElement('option');
        option.value = value;
        
        // Verificar se é um subgrupo para aplicar negrito
        if (subgroups.includes(value)) {
            option.innerHTML = `<strong>${label}</strong>`;
            // Adicionar um estilo para indicar que é um subgrupo
            option.style.fontWeight = 'bold';
            option.style.backgroundColor = '#f0f4f8';
        } else {
            option.textContent = label;
        }
        
        categoryEl.appendChild(option);
    }
    
    // Atualizar também o filtro de categorias
    updateFilterCategories();
}

// Função para atualizar o filtro de categorias
function updateFilterCategories() {
    // Salvar valor atual
    const currentValue = filterCategoryEl.value;
    
    // Limpar select de filtro de categorias
    filterCategoryEl.innerHTML = '<option value="all">Todas as categorias</option>';
    
    // Lista de subgrupos para destacar em negrito
    const subgroups = [
        'moradia', 'alimentacao', 'transporte', 'saude', 'lazer', 
        'consultorio_loja', 'outros_gastos'
    ];
    
    // Adicionar todas as categorias (tanto de entrada quanto de saída)
    const allCategories = {...categories.income, ...categories.expense};
    for (const [value, label] of Object.entries(allCategories)) {
        const option = document.createElement('option');
        option.value = value;
        
        // Verificar se é um subgrupo para aplicar negrito
        if (subgroups.includes(value)) {
            option.innerHTML = `<strong>${label}</strong>`;
            // Adicionar um estilo para indicar que é um subgrupo
            option.style.fontWeight = 'bold';
            option.style.backgroundColor = '#f0f4f8';
        } else {
            option.textContent = label;
        }
        
        filterCategoryEl.appendChild(option);
    }
    
    // Restaurar valor anterior se possível
    if (currentValue && currentValue !== 'all') {
        filterCategoryEl.value = currentValue;
        // Se o valor não existir mais, voltar para 'all'
        if (filterCategoryEl.value !== currentValue) {
            filterCategoryEl.value = 'all';
        }
    }
}

// Função para gerar ID único
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Função para formatar data
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    // Corrigir o problema de fuso horário
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Meses em JS são 0-11
    const day = parseInt(dateParts[2]);
    
    const date = new Date(year, month, day);
    return date.toLocaleDateString('pt-BR', options);
}

// Função para formatar valor monetário
function formatCurrency(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
}

// Função para inicializar elementos DOM
function initializeCategoryElements() {
    expenseCategoriesEl = document.getElementById('expense-category-list');
    incomeCategoriesEl = document.getElementById('income-category-list');
    categoryTabs = document.querySelectorAll('.category-tab');
    categoryContents = document.querySelectorAll('.category-content');
    
    // Adicionar event listeners para as abas de categorias
    if (categoryTabs && categoryTabs.length > 0) {
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remover classe active de todas as abas
                categoryTabs.forEach(t => t.classList.remove('active'));
                // Adicionar classe active à aba clicada
                tab.classList.add('active');
                
                // Mostrar conteúdo correspondente
                const type = tab.dataset.type;
                if (categoryContents) {
                    categoryContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${type}-categories`) {
                            content.classList.add('active');
                        }
                    });
                }
                
                // Atualizar as categorias com base no tipo selecionado
                updateCategoryTotals(type);
            });
        });
    }
}

// Função para obter ícone apropriado para a categoria
function getCategoryIcon(category, type) {
    const icons = {
        // Ícones para categorias de receita
        'salario': 'fas fa-money-bill-wave',
        'freelance': 'fas fa-laptop-code',
        'investimentos': 'fas fa-chart-line',
        'vendas': 'fas fa-store',
        'aluguel': 'fas fa-home',
        'presente': 'fas fa-gift',
        'outros_income': 'fas fa-coins',
        
        // Ícones para subgrupos de despesa
        'moradia': 'fas fa-house-user',
        'alimentacao': 'fas fa-utensils',
        'transporte': 'fas fa-car',
        'saude': 'fas fa-heartbeat',
        'lazer': 'fas fa-gamepad',
        'consultorio_loja': 'fas fa-briefcase',
        'outros_gastos': 'fas fa-shopping-bag',
        
        // Ícones para categorias de despesa - Moradia
        'aluguel_parcela': 'fas fa-home',
        'condominio': 'fas fa-building',
        'alarme_seguranca': 'fas fa-shield-alt',
        'conta_luz': 'fas fa-lightbulb',
        'conta_agua': 'fas fa-tint',
        'gas_agua_mineral': 'fas fa-fire',
        'iptu': 'fas fa-file-invoice-dollar',
        'internet_moradia': 'fas fa-wifi',
        'telefone_celular': 'fas fa-phone',
        'consertos_manutencao': 'fas fa-tools',
        
        // Ícones para categorias de despesa - Alimentação
        'supermercado': 'fas fa-shopping-cart',
        'restaurante': 'fas fa-utensils',
        'padaria_cafe': 'fas fa-bread-slice',
        'guilherme_c_masio': 'fas fa-user',
        'delivery': 'fas fa-motorcycle',
        
        // Ícones para categorias de despesa - Transporte
        'combustivel': 'fas fa-gas-pump',
        'manutencao_carro': 'fas fa-wrench',
        'pedagio': 'fas fa-road',
        'estacionamento': 'fas fa-parking',
        'ipva': 'fas fa-file-invoice-dollar',
        'uber_99': 'fas fa-taxi',
        
        // Ícones para categorias de despesa - Saúde
        'plano_saude': 'fas fa-file-medical',
        'exames': 'fas fa-microscope',
        'consultas': 'fas fa-user-md',
        'farmacia': 'fas fa-pills',
        'academia': 'fas fa-dumbbell',
        
        // Ícones para categorias de despesa - Lazer/informação
        'assinatura_ifood_apple': 'fas fa-mobile-alt',
        'assinatura_canais': 'fas fa-tv',
        'netflix': 'fas fa-film',
        'spotify': 'fas fa-music',
        'programas_culturais': 'fas fa-ticket-alt',
        
        // Ícones para categorias de despesa - Consultório/Loja
        'aluguel_consultorio': 'fas fa-building',
        'condominio_consultorio': 'fas fa-city',
        'luz_consultorio': 'fas fa-lightbulb',
        'telefone_consultorio': 'fas fa-phone-office',
        'manutencao_consultorio': 'fas fa-tools',
        'contabilidade': 'fas fa-calculator',
        
        // Ícones para categorias de despesa - Outros gastos
        'internet_outros': 'fas fa-wifi',
        'outros_gastos_gerais': 'fas fa-shopping-bag',
        'eletrodomesticos': 'fas fa-blender',
        'roupas': 'fas fa-tshirt',
        'otica': 'fas fa-glasses',
        'racao_pet': 'fas fa-paw',
        'costureira': 'fas fa-cut',
        'cartao_credito': 'fas fa-credit-card',
        'debitos_bancarios': 'fas fa-university',
        'presentes': 'fas fa-gift',
        'imposto_renda': 'fas fa-file-invoice-dollar',
        'seguros': 'fas fa-shield-alt',
        'viajem': 'fas fa-plane',
        'salao': 'fas fa-spa',
        'barbeiro': 'fas fa-cut',
        'faculdade_cursos': 'fas fa-graduation-cap',
        'outras_despesas': 'fas fa-receipt'
    };
    
    return icons[category] || (type === 'income' ? 'fas fa-coins' : 'fas fa-shopping-bag');
}

// Função para obter o rótulo da categoria
function getCategoryLabel(categoryValue) {
    // Verificar em ambas as listas de categorias
    const allCategories = {...categories.income, ...categories.expense};
    return allCategories[categoryValue] || categoryValue;
}

// Função para atualizar os totais por categoria
function updateCategoryTotals(activeType = null) {
    // Verificar se os elementos existem
    if (!expenseCategoriesEl || !incomeCategoriesEl) {
        console.warn('Elementos de categoria não encontrados');
        return;
    }
    
    // Obter parâmetros de ano e mês da URL
    const params = getUrlParameters();
    
    // Filtrar transações pelo mês e ano selecionados, se houver
    let filteredTransactions = transactions;
    if (params.year && params.month) {
        filteredTransactions = transactions.filter(transaction => {
            return isDateInPeriod(transaction.date, params.year, params.month);
        });
    }
    
    // Limpar listas de categorias
    expenseCategoriesEl.innerHTML = '';
    incomeCategoriesEl.innerHTML = '';
    
    // Se não houver tipo ativo especificado, usar o tipo da aba ativa
    if (!activeType) {
        const activeTab = document.querySelector('.category-tab.active');
        if (activeTab) {
            activeType = activeTab.dataset.type;
        }
    }
    
    // Adicionar ícones às abas se ainda não tiverem
    const expenseTab = document.querySelector('.category-tab[data-type="expense"]');
    const incomeTab = document.querySelector('.category-tab[data-type="income"]');
    
    if (expenseTab && !expenseTab.querySelector('i')) {
        expenseTab.innerHTML = '<i class="fas fa-arrow-down"></i> Despesas';
    }
    
    if (incomeTab && !incomeTab.querySelector('i')) {
        incomeTab.innerHTML = '<i class="fas fa-arrow-up"></i> Receitas';
    }
    
    // Agrupar despesas por categoria
    const expensesByCategory = {};
    filteredTransactions
        .filter(transaction => transaction.amount < 0)
        .forEach(transaction => {
            const category = transaction.category;
            const amount = Math.abs(transaction.amount);
            expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
        });
    
    // Agrupar receitas por categoria
    const incomesByCategory = {};
    filteredTransactions
        .filter(transaction => transaction.amount > 0)
        .forEach(transaction => {
            const category = transaction.category;
            const amount = transaction.amount;
            incomesByCategory[category] = (incomesByCategory[category] || 0) + amount;
        });
    
    // Atualizar apenas as categorias do tipo selecionado ou ambas se nenhum tipo for especificado
    if (!activeType || activeType === 'expense') {
        // Definir subgrupos de despesas
        const subgroups = {
            'moradia': ['aluguel_parcela', 'condominio', 'alarme_seguranca', 'conta_luz', 'conta_agua', 'gas_agua_mineral', 'iptu', 'internet_moradia', 'telefone_celular', 'consertos_manutencao'],
            'alimentacao': ['supermercado', 'restaurante', 'padaria_cafe', 'guilherme_c_masio', 'delivery'],
            'transporte': ['combustivel', 'manutencao_carro', 'pedagio', 'estacionamento', 'ipva', 'uber_99'],
            'saude': ['plano_saude', 'exames', 'consultas', 'farmacia', 'academia'],
            'lazer': ['assinatura_ifood_apple', 'assinatura_canais', 'netflix', 'spotify', 'programas_culturais'],
            'consultorio_loja': ['aluguel_consultorio', 'condominio_consultorio', 'luz_consultorio', 'telefone_consultorio', 'manutencao_consultorio', 'contabilidade'],
            'outros_gastos': ['internet_outros', 'outros_gastos_gerais', 'eletrodomesticos', 'roupas', 'otica', 'racao_pet', 'costureira', 'cartao_credito', 'debitos_bancarios', 'presentes', 'imposto_renda', 'seguros', 'viajem', 'salao', 'barbeiro', 'faculdade_cursos', 'outras_despesas']
        };
        
        // Verificar se há despesas
        const hasAnyExpense = Object.keys(expensesByCategory).length > 0;
        
        if (!hasAnyExpense) {
            // Se não houver despesas, mostrar mensagem
            const noExpensesMsg = document.createElement('div');
            noExpensesMsg.className = 'no-data-message';
            noExpensesMsg.innerHTML = '<i class="fas fa-info-circle"></i> Nenhuma despesa registrada neste período';
            expenseCategoriesEl.appendChild(noExpensesMsg);
        } else {
            // Adicionar subgrupos de despesas
            Object.entries(subgroups).forEach(([subgroup, items]) => {
                // Calcular total do subgrupo
                let subgroupTotal = 0;
                let hasItems = false;
                
                items.forEach(category => {
                    if (expensesByCategory[category]) {
                        hasItems = true;
                        subgroupTotal += expensesByCategory[category];
                    }
                });
                
                // Criar cabeçalho do subgrupo com total
                const subgroupHeader = document.createElement('div');
                subgroupHeader.className = 'category-subgroup-header';
                subgroupHeader.innerHTML = `
                    <div class="category-info">
                        <div class="category-icon">
                            <i class="${getCategoryIcon(subgroup, 'expense')}"></i>
                        </div>
                        <div class="category-name"><strong>${getCategoryLabel(subgroup)}</strong></div>
                    </div>
                    ${hasItems ? `<div class="category-amount">${formatCurrency(subgroupTotal)}</div>` : ''}
                `;
                expenseCategoriesEl.appendChild(subgroupHeader);
                
                // Adicionar itens do subgrupo
                if (hasItems) {
                    // Criar container para os itens do subgrupo
                    const subgroupItemsContainer = document.createElement('div');
                    subgroupItemsContainer.className = 'subgroup-items-container';
                    subgroupItemsContainer.style.display = 'contents'; // Para manter o grid layout
                    
                    items.forEach(category => {
                        if (expensesByCategory[category]) {
                            const amount = expensesByCategory[category];
                            const categoryLabel = getCategoryLabel(category);
                            const categoryIcon = getCategoryIcon(category, 'expense');
                            
                            const categoryCard = document.createElement('div');
                            categoryCard.className = 'category-card expense subgroup-item';
                            categoryCard.innerHTML = `
                                <div class="category-info">
                                    <div class="category-icon">
                                        <i class="${categoryIcon}"></i>
                                    </div>
                                    <div class="category-name">${categoryLabel}</div>
                                </div>
                                <div class="category-amount">${formatCurrency(amount)}</div>
                            `;
                            
                            // Adicionar animação com atraso baseado no índice
                            categoryCard.style.animationDelay = `${items.indexOf(category) * 0.05}s`;
                            
                            subgroupItemsContainer.appendChild(categoryCard);
                        }
                    });
                    
                    expenseCategoriesEl.appendChild(subgroupItemsContainer);
                } else {
                    // Se não houver itens no subgrupo, mostrar mensagem
                    const noItemsMsg = document.createElement('div');
                    noItemsMsg.className = 'no-data-message subgroup-item';
                    noItemsMsg.innerHTML = `<i class="fas fa-info-circle"></i> Nenhuma despesa em ${getCategoryLabel(subgroup)}`;
                    expenseCategoriesEl.appendChild(noItemsMsg);
                }
            });
        }
    }
    
    if (!activeType || activeType === 'income') {
        // Verificar se há receitas
        const hasAnyIncome = Object.keys(incomesByCategory).length > 0;
        
        if (!hasAnyIncome) {
            // Se não houver receitas, mostrar mensagem
            const noIncomesMsg = document.createElement('div');
            noIncomesMsg.className = 'no-data-message';
            noIncomesMsg.innerHTML = '<i class="fas fa-info-circle"></i> Nenhuma receita registrada neste período';
            incomeCategoriesEl.appendChild(noIncomesMsg);
        } else {
            // Adicionar cards de categorias de receita
            Object.entries(incomesByCategory)
                .sort((a, b) => b[1] - a[1]) // Ordenar por valor (maior para menor)
                .forEach(([category, amount], index) => {
                    const categoryLabel = getCategoryLabel(category);
                    const categoryIcon = getCategoryIcon(category, 'income');
                    
                    const categoryCard = document.createElement('div');
                    categoryCard.className = 'category-card income';
                    categoryCard.innerHTML = `
                        <div class="category-info">
                            <div class="category-icon">
                                <i class="${categoryIcon}"></i>
                            </div>
                            <div class="category-name">${categoryLabel}</div>
                        </div>
                        <div class="category-amount">${formatCurrency(amount)}</div>
                    `;
                    
                    // Adicionar animação com atraso baseado no índice
                    categoryCard.style.animationDelay = `${index * 0.05}s`;
                    
                    incomeCategoriesEl.appendChild(categoryCard);
                });
        }
    }
}

// Função para adicionar transação ao histórico
function addTransactionToDOM(transaction, filter = true) {
    // Verificar se a transação deve ser filtrada
    if (filter) {
        const searchTerm = searchEl.value.toLowerCase();
        const categoryFilter = filterCategoryEl.value;
        const typeFilter = filterTypeEl.value;
        const startDate = filterDateStartEl.value ? new Date(filterDateStartEl.value) : null;
        const endDate = filterDateEndEl.value ? new Date(filterDateEndEl.value) : null;
        
        // Filtrar por termo de busca
        if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm)) {
            return;
        }
        
        // Filtrar por categoria
        if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
            return;
        }
        
        // Filtrar por tipo (receita/despesa)
        if (typeFilter === 'income' && transaction.amount < 0) {
            return;
        }
        if (typeFilter === 'expense' && transaction.amount > 0) {
            return;
        }
        
        // Filtrar por data
        const transactionDate = new Date(transaction.date);
        if (startDate && transactionDate < startDate) {
            return;
        }
        if (endDate && transactionDate > endDate) {
            return;
        }
        
        // Filtrar por mês e ano da URL
        const params = getUrlParameters();
        if (params.year && params.month) {
            if (!isDateInPeriod(transaction.date, params.year, params.month)) {
                return;
            }
        }
    }

    // Criar elemento de lista para a transação
    const item = document.createElement('li');
    item.classList.add('transaction-item');
    
    // Definir classe baseada no tipo de transação (receita/despesa)
    const transactionType = transaction.amount < 0 ? 'expense' : 'income';
    item.classList.add(transactionType);
    
    // Selecionar ícone apropriado para a categoria
    const categoryIcon = getCategoryIcon(transaction.category, transactionType);
    
    // Criar HTML para o item da transação
    item.innerHTML = `
        <div class="transaction-info">
            <h3><i class="${categoryIcon}"></i> ${transaction.description}</h3>
            <div class="transaction-meta">
                <span><i class="fas fa-calendar-alt"></i> ${formatDate(transaction.date)}</span>
                <span class="transaction-category ${transactionType}">
                    <i class="fas fa-tag"></i> ${getCategoryLabel(transaction.category)}
                </span>
                ${transaction.notes ? `<span><i class="fas fa-sticky-note"></i> ${transaction.notes}</span>` : ''}
            </div>
        </div>
        <div class="transaction-amount ${transactionType}">
            ${transactionType === 'income' ? '+' : '-'} ${formatCurrency(Math.abs(transaction.amount))}
        </div>
        <div class="transaction-actions">
            <button class="action-btn edit" onclick="editTransaction('${transaction.id}')" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="removeTransaction('${transaction.id}')" title="Excluir">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    // Adicionar item à lista de transações
    transactionListEl.appendChild(item);
}

// Função para animar números (contagem)
function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = formatCurrency(value);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Função para atualizar os saldos
function updateBalance() {
    // Obter parâmetros de ano e mês da URL
    const params = getUrlParameters();
    
    // Filtrar transações pelo mês e ano selecionados, se houver
    let filteredTransactions = transactions;
    if (params.year && params.month) {
        filteredTransactions = transactions.filter(transaction => {
            return isDateInPeriod(transaction.date, params.year, params.month);
        });
    }
    
    // Calcular valores com as transações filtradas
    const amounts = filteredTransactions.map(transaction => transaction.amount);
    const total = amounts.length > 0 ? amounts.reduce((acc, amount) => acc + amount, 0).toFixed(2) : 0;
    
    const income = amounts.length > 0 ?
        amounts
            .filter(amount => amount > 0)
            .reduce((acc, amount) => acc + amount, 0)
            .toFixed(2) : 0;
            
    const expense = amounts.length > 0 ?
        (amounts
            .filter(amount => amount < 0)
            .reduce((acc, amount) => acc + amount, 0) * -1)
            .toFixed(2) : 0;
    
    // Obter valores atuais (removendo formatação)
    const currentIncome = parseFloat(incomeEl.textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
    const currentExpense = parseFloat(expenseEl.textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
    const currentBalance = parseFloat(balanceEl.textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
    
    // Animar os valores
    animateNumber(incomeEl, currentIncome, income, 800);
    animateNumber(expenseEl, currentExpense, expense, 800);
    animateNumber(balanceEl, currentBalance, total, 800);
}

// Função para remover transação
async function removeTransaction(id) {
    try {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            console.log('Iniciando remoção da transação com ID:', id);
            
            // Verificar se o usuário está autenticado
            if (!auth.currentUser) {
                console.log('Usuário não autenticado, redirecionando para a página de login...');
                window.location.href = 'welcome.html';
                throw new Error('Usuário não autenticado');
            }
            
            // Remover do Firestore
            console.log('Removendo transação do Firestore...');
            await db.collection('users').doc(auth.currentUser.uid)
                .collection('transactions').doc(id.toString()).delete();
            console.log('Transação removida do Firestore com sucesso');
                
            // Remover do array local
            transactions = transactions.filter(transaction => transaction.id !== id);
            console.log('Transação removida do array local. Restantes:', transactions.length);
            
            // Atualizar interface
            init();
        }
    } catch (error) {
        console.error('Erro ao remover transação:', error);
        alert('Erro ao remover transação. Por favor, tente novamente.');
    }
}

// Função para editar transação
function editTransaction(id) {
    // Encontrar a transação pelo ID
    const transaction = transactions.find(transaction => transaction.id === id);
    
    if (transaction) {
        // Determinar o tipo de transação
        const type = transaction.amount < 0 ? 'expense' : 'income';
        
        // Atualizar botões de tipo
        setTransactionType(type);
        
        // Preencher o formulário com os dados da transação
        descriptionEl.value = transaction.description;
        amountEl.value = Math.abs(transaction.amount);
        dateEl.value = transaction.date;
        notesEl.value = transaction.notes || '';
        
        // Carregar categorias apropriadas e selecionar a categoria da transação
        loadCategories(type);
        categoryEl.value = transaction.category;
        
        // Armazenar ID da transação em edição
        editingTransactionId = id;
        
        // Alterar texto do botão
        document.querySelector('button[type="submit"]').textContent = 'Atualizar Transação';
        
        // Rolar até o formulário
        transactionFormEl.scrollIntoView({ behavior: 'smooth' });
    }
}

// Função para definir o tipo de transação
function setTransactionType(type) {
    currentTransactionType = type;
    
    // Atualizar classes dos botões
    if (type === 'income') {
        incomeBtnEl.classList.add('active');
        expenseBtnEl.classList.remove('active');
    } else {
        incomeBtnEl.classList.remove('active');
        expenseBtnEl.classList.add('active');
    }
    
    // Carregar categorias apropriadas
    loadCategories(type);
}

// Função para adicionar ou atualizar uma transação no Firestore
async function saveTransactionToFirestore(transaction) {
    try {
        console.log('Iniciando salvamento de transação no Firestore:', transaction);
        
        // Verificar se o usuário está autenticado
        if (!auth.currentUser) {
            console.log('Usuário não autenticado, tentando login anônimo...');
            await auth.signInAnonymously();
            console.log('Login anônimo realizado com sucesso. UID:', auth.currentUser.uid);
        } else {
            console.log('Usuário já autenticado. UID:', auth.currentUser.uid);
        }
        
        const userRef = db.collection('users').doc(auth.currentUser.uid);
        const transactionsRef = userRef.collection('transactions');
        
        // Remover o campo id antes de salvar (se existir)
        const transactionToSave = {...transaction};
        if (transactionToSave.id) {
            const idToUse = transactionToSave.id;
            delete transactionToSave.id;
            
            // Se for uma edição, atualizar o documento existente
            console.log('Atualizando transação existente com ID:', idToUse);
            await transactionsRef.doc(idToUse).set(transactionToSave);
            console.log('Transação atualizada no Firestore com sucesso');
            
            // Retornar o objeto com o ID
            return {
                ...transactionToSave,
                id: idToUse
            };
        } else {
            // Se for uma nova transação, criar um novo documento
            console.log('Criando nova transação no Firestore');
            const docRef = await transactionsRef.add(transactionToSave);
            console.log('Nova transação adicionada ao Firestore com ID:', docRef.id);
            
            // Retornar o objeto com o novo ID
            return {
                ...transactionToSave,
                id: docRef.id
            };
        }
    } catch (error) {
        console.error('Erro ao salvar transação no Firestore:', error);
        throw error; // Propagar o erro para tratamento no chamador
    }
}

// Função para inicializar a aplicação
function init() {
    // Limpar lista de transações
    transactionListEl.innerHTML = '';
    
    // Adicionar transações ao DOM
    transactions.forEach(transaction => addTransactionToDOM(transaction));
    
    // Atualizar saldos
    updateBalance();
    
    // Atualizar gráficos
    updateCharts();
    
    // Atualizar totais por categoria
    updateCategoryTotals();
}

// Variáveis para armazenar instâncias dos gráficos
let expenseChart = null;
let incomeExpenseChart = null;

// Função para atualizar gráfico de despesas por categoria
function updateExpenseChart() {
    if (!expenseChartEl) {
        console.error('Elemento expense-chart não encontrado');
        return;
    }
    
    const ctx = expenseChartEl.getContext('2d');
    
    // Destruir gráfico existente se houver
    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }
    
    // Obter parâmetros de ano e mês da URL
    const params = getUrlParameters();
    
    // Filtrar transações pelo mês e ano selecionados, se houver
    let filteredTransactions = transactions;
    if (params.year && params.month) {
        filteredTransactions = transactions.filter(transaction => {
            return isDateInPeriod(transaction.date, params.year, params.month);
        });
    }
    
    // Filtrar apenas despesas (valores negativos)
    const expenses = filteredTransactions.filter(transaction => transaction.amount < 0);
    
    if (expenses.length === 0) {
        // Se não há despesas, mostrar mensagem
        expenseChartEl.style.display = 'none';
        const container = expenseChartEl.parentElement;
        let noDataMsg = container.querySelector('.no-data-message');
        if (!noDataMsg) {
            noDataMsg = document.createElement('div');
            noDataMsg.className = 'no-data-message';
            noDataMsg.textContent = 'Nenhuma despesa registrada';
            container.appendChild(noDataMsg);
        }
        return;
    }
    
    // Remover mensagem de "sem dados" se existir
    const container = expenseChartEl.parentElement;
    const noDataMsg = container.querySelector('.no-data-message');
    if (noDataMsg) {
        noDataMsg.remove();
    }
    expenseChartEl.style.display = 'block';
    
    // Agrupar despesas por categoria
    const expensesByCategory = {};
    expenses.forEach(transaction => {
        const category = getCategoryLabel(transaction.category);
        const amount = Math.abs(transaction.amount);
        expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
    });
    
    // Preparar dados para o gráfico
    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#E7E9ED', '#C9CBCF'
    ];
    
    // Criar novo gráfico
    try {
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.parsed);
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico de despesas:', error);
    }
}

// Função para atualizar gráfico de receitas vs despesas
function updateIncomeExpenseChart() {
    if (!incomeExpenseChartEl) {
        console.error('Elemento income-expense-chart não encontrado');
        return;
    }
    
    const ctx = incomeExpenseChartEl.getContext('2d');
    
    // Destruir gráfico existente se houver
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
        incomeExpenseChart = null;
    }
    
    // Obter parâmetros de ano e mês da URL
    const params = getUrlParameters();
    
    // Filtrar transações pelo mês e ano selecionados, se houver
    let filteredTransactions = transactions;
    if (params.year && params.month) {
        filteredTransactions = transactions.filter(transaction => {
            return isDateInPeriod(transaction.date, params.year, params.month);
        });
    }
    
    // Calcular totais com as transações filtradas
    const totalIncome = filteredTransactions
        .filter(transaction => transaction.amount > 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
        
    const totalExpense = Math.abs(filteredTransactions
        .filter(transaction => transaction.amount < 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0));
    
    if (totalIncome === 0 && totalExpense === 0) {
        // Se não há dados, mostrar mensagem
        incomeExpenseChartEl.style.display = 'none';
        const container = incomeExpenseChartEl.parentElement;
        let noDataMsg = container.querySelector('.no-data-message');
        if (!noDataMsg) {
            noDataMsg = document.createElement('div');
            noDataMsg.className = 'no-data-message';
            noDataMsg.textContent = 'Nenhuma transação registrada';
            container.appendChild(noDataMsg);
        }
        return;
    }
    
    // Remover mensagem de "sem dados" se existir
    const container = incomeExpenseChartEl.parentElement;
    const noDataMsg = container.querySelector('.no-data-message');
    if (noDataMsg) {
        noDataMsg.remove();
    }
    incomeExpenseChartEl.style.display = 'block';
    
    // Criar novo gráfico
    try {
        incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Receitas', 'Despesas'],
                datasets: [{
                    label: 'Valor (R$)',
                    data: [totalIncome, totalExpense],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderColor: ['#1e7e34', '#c82333'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico de receitas vs despesas:', error);
    }
}

// Função principal para atualizar todos os gráficos
function updateCharts() {
    // Aguardar um pouco para garantir que os elementos estejam prontos
    setTimeout(() => {
        updateExpenseChart();
        updateIncomeExpenseChart();
    }, 100);
}

// Event Listener para os botões de tipo de transação
incomeBtnEl.addEventListener('click', function() {
    setTransactionType('income');
});

expenseBtnEl.addEventListener('click', function() {
    setTransactionType('expense');
});

// Event Listener para o formulário de transação
transactionFormEl.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar formulário
    if (descriptionEl.value.trim() === '' || amountEl.value.trim() === '' || categoryEl.value === '') {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        showLoadingIndicator();
        console.log('Processando envio do formulário de transação...');
        
        // Obter valor absoluto do montante
        let amount = Math.abs(parseFloat(amountEl.value));
        
        // Se for despesa, tornar o valor negativo
        if (currentTransactionType === 'expense') {
            amount = -amount;
        }
        
        // Criar objeto de transação
        let transaction = {
            description: descriptionEl.value,
            amount: amount,
            category: categoryEl.value,
            date: dateEl.value,
            notes: notesEl.value,
            createdAt: new Date().toISOString()
        };
        
        console.log('Objeto de transação criado:', transaction);
        
        // Se estiver editando, incluir o ID
        if (editingTransactionId) {
            console.log('Editando transação existente com ID:', editingTransactionId);
            transaction.id = editingTransactionId;
        }
        
        // Salvar no Firestore
        console.log('Enviando transação para o Firestore...');
        transaction = await saveTransactionToFirestore(transaction);
        console.log('Transação salva com sucesso:', transaction);
        
        // Se estiver editando, atualizar a transação no array local
        if (editingTransactionId) {
            const index = transactions.findIndex(t => t.id === editingTransactionId);
            if (index !== -1) {
                transactions[index] = transaction;
                console.log('Transação atualizada no array local');
            }
            editingTransactionId = null;
            document.querySelector('button[type="submit"]').textContent = 'Adicionar Transação';
        } else {
            // Adicionar nova transação ao array local
            transactions.push(transaction);
            console.log('Nova transação adicionada ao array local. Total:', transactions.length);
        }
        
        // Atualizar interface
        init();
        
        // Limpar formulário
        transactionFormEl.reset();
        dateEl.valueAsDate = new Date();
        
        // Resetar para o tipo de entrada (padrão)
        setTransactionType('income');
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Erro ao processar transação:', error);
        alert('Erro ao processar transação: ' + error.message);
        hideLoadingIndicator();
    }
});

// Event Listeners para filtros
searchEl.addEventListener('input', init);
filterCategoryEl.addEventListener('change', init);
filterTypeEl.addEventListener('change', init);
filterDateStartEl.addEventListener('change', init);
filterDateEndEl.addEventListener('change', init);

// Configuração da tela de boas-vindas
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    // Botão para voltar à tela de seleção de período
    const backToSelectBtn = document.createElement('button');
    backToSelectBtn.id = 'back-to-select';
    backToSelectBtn.className = 'btn';
    backToSelectBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Selecionar Outro Período';
    backToSelectBtn.addEventListener('click', function() {
        window.location.href = 'welcome.html';
    });
    
    // Adicionar botão após o header
    const header = document.querySelector('header');
    if (header) {
        header.insertAdjacentElement('afterend', backToSelectBtn);
    }
    
    // Exibir o período selecionado
    const params = getUrlParameters();
    if (params.year && params.month) {
        const periodTitle = document.createElement('div');
        periodTitle.className = 'period-title';
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        // Criar span para o texto do período
        const periodText = document.createElement('span');
        periodText.textContent = `Período: ${monthNames[params.month]} de ${params.year}`;
        periodTitle.appendChild(periodText);
        
        // Criar botão de relatório
        const reportBtn = document.createElement('button');
        reportBtn.className = 'report-btn';
        reportBtn.innerHTML = '<i class="fas fa-file-pdf"></i><span> Gerar Relatório</span>';
        reportBtn.title = "Gerar Relatório PDF"; // Adiciona tooltip
        reportBtn.addEventListener('click', () => generatePDFReport(params.month, params.year, monthNames));
        periodTitle.appendChild(reportBtn);
        
        if (header) {
            header.insertAdjacentElement('afterend', periodTitle);
        }
    }
}

// Definir grupos de categorias hierárquicos
const categoryGroups = {
    income: {
        'receitas': {
            name: 'Receitas',
            icon: 'fas fa-coins',
            color: [46, 204, 113],
            categories: ['salario_mensal', 'outros_recebimentos']
        }
    },
    expense: {
        'moradia': {
            name: 'Moradia',
            icon: 'fas fa-home',
            color: [52, 152, 219],
            categories: ['moradia', 'aluguel_parcela', 'condominio', 'alarme_seguranca', 'conta_luz', 'conta_agua', 'gas_agua_mineral', 'iptu', 'internet_moradia', 'telefone_celular', 'consertos_manutencao']
        },
        'alimentacao': {
            name: 'Alimentação',
            icon: 'fas fa-utensils',
            color: [230, 126, 34],
            categories: ['alimentacao', 'supermercado', 'restaurante', 'padaria_cafe', 'guilherme_c_masio', 'delivery']
        },
        'transporte': {
            name: 'Transporte',
            icon: 'fas fa-car',
            color: [155, 89, 182],
            categories: ['transporte', 'combustivel', 'manutencao_carro', 'pedagio', 'estacionamento', 'ipva', 'uber_99']
        },
        'saude': {
            name: 'Saúde',
            icon: 'fas fa-heartbeat',
            color: [231, 76, 60],
            categories: ['saude', 'plano_saude', 'exames', 'consultas', 'farmacia', 'academia']
        },
        'lazer': {
            name: 'Lazer e Entretenimento',
            icon: 'fas fa-gamepad',
            color: [26, 188, 156],
            categories: ['lazer', 'assinatura_ifood_apple', 'assinatura_canais', 'netflix', 'spotify', 'programas_culturais']
        },
        'consultorio': {
            name: 'Consultório/Loja',
            icon: 'fas fa-briefcase',
            color: [241, 196, 15],
            categories: ['consultorio_loja', 'aluguel_consultorio', 'condominio_consultorio', 'luz_consultorio', 'telefone_consultorio', 'manutencao_consultorio', 'contabilidade']
        },
        'outros': {
            name: 'Outros Gastos',
            icon: 'fas fa-ellipsis-h',
            color: [149, 165, 166],
            categories: ['outros_gastos', 'internet_outros', 'outros_gastos_gerais', 'eletrodomesticos', 'roupas', 'otica', 'racao_pet', 'costureira', 'cartao_credito', 'debitos_bancarios', 'presentes', 'imposto_renda', 'seguros', 'viajem', 'salao', 'barbeiro', 'faculdade_cursos', 'outras_despesas']
        }
    }
};

// Função para agrupar transações por categorias
function groupTransactionsByCategory(transactions, type) {
    const groups = {};
    const groupsConfig = categoryGroups[type];
    
    // Inicializar grupos
    Object.keys(groupsConfig).forEach(groupKey => {
        groups[groupKey] = {
            ...groupsConfig[groupKey],
            subcategories: {},
            total: 0
        };
    });
    
    // Agrupar transações por categoria e subcategoria
    transactions.forEach(transaction => {
        let grouped = false;
        
        Object.keys(groupsConfig).forEach(groupKey => {
            if (groupsConfig[groupKey].categories.includes(transaction.category)) {
                const subcategoryName = getCategoryLabel(transaction.category);
                
                // Inicializar subcategoria se não existir
                if (!groups[groupKey].subcategories[subcategoryName]) {
                    groups[groupKey].subcategories[subcategoryName] = {
                        transactions: [],
                        total: 0
                    };
                }
                
                groups[groupKey].subcategories[subcategoryName].transactions.push(transaction);
                groups[groupKey].subcategories[subcategoryName].total += Math.abs(transaction.amount);
                groups[groupKey].total += Math.abs(transaction.amount);
                grouped = true;
            }
        });
        
        // Se não foi agrupada, adicionar ao grupo "outros"
        if (!grouped && type === 'expense') {
            const subcategoryName = getCategoryLabel(transaction.category);
            
            if (!groups['outros'].subcategories[subcategoryName]) {
                groups['outros'].subcategories[subcategoryName] = {
                    transactions: [],
                    total: 0
                };
            }
            
            groups['outros'].subcategories[subcategoryName].transactions.push(transaction);
            groups['outros'].subcategories[subcategoryName].total += Math.abs(transaction.amount);
            groups['outros'].total += Math.abs(transaction.amount);
        }
    });
    
    // Remover grupos vazios
    Object.keys(groups).forEach(groupKey => {
        if (Object.keys(groups[groupKey].subcategories).length === 0) {
            delete groups[groupKey];
        }
    });
    
    return groups;
}

// Função para gerar relatório PDF personalizado
function generatePDFReport(month, year, monthNames) {
    // Obter transações do período selecionado
    const filteredTransactions = transactions.filter(transaction => {
        return isDateInPeriod(transaction.date, year, month);
    });
    
    // Separar entradas e saídas
    const incomes = filteredTransactions.filter(t => t.amount > 0);
    const expenses = filteredTransactions.filter(t => t.amount < 0);
    
    // Agrupar transações por categoria
    const incomeGroups = groupTransactionsByCategory(incomes, 'income');
    const expenseGroups = groupTransactionsByCategory(expenses, 'expense');
    
    // Calcular totais
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome + totalExpense;
    
    // Criar PDF usando jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Definir cores para o documento - Paleta moderna e harmoniosa
    const primaryColor = [70, 90, 110];    // Azul mais claro e elegante
    const successColor = [39, 174, 96];    // Verde mais suave
    const dangerColor = [192, 57, 43];     // Vermelho mais suave
    const lightGray = [250, 251, 252];     // Cinza muito claro
    const mediumGray = [200, 206, 212];    // Cinza médio mais claro
    const darkGray = [90, 100, 110];       // Cinza escuro mais claro
    const accentColor = [140, 150, 160];   // Cinza azulado mais claro
    const headerGradient = [60, 140, 200]; // Azul gradiente mais claro
    
    let currentY = 20;
    
    // Função para adicionar nova página se necessário
    function checkPageBreak(neededSpace) {
        if (currentY + neededSpace > 270) {
            doc.addPage();
            currentY = 20;
            return true;
        }
        return false;
    }
    
    // Cabeçalho moderno com gradiente aprimorado
    // Fundo principal do cabeçalho
    doc.setFillColor(headerGradient[0], headerGradient[1], headerGradient[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 50, 'F');
    
    // Faixa decorativa superior
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 8, 'F');
    
    // Sombra sutil do cabeçalho
    doc.setFillColor(0, 0, 0, 0.08);
    doc.rect(0, 50, doc.internal.pageSize.getWidth(), 3, 'F');
    
    // Título principal com melhor tipografia
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text('RELATÓRIO FINANCEIRO', 105, 22, { align: 'center' });
    
    // Subtítulo com período - mais destaque
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`${monthNames[month]} de ${year}`, 105, 34, { align: 'center' });
    
    // Data de geração com melhor posicionamento
    doc.setFontSize(11);
    doc.setTextColor(240, 240, 240);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, 44, { align: 'center' });
    
    currentY = 65;
    
    // Card de resumo financeiro com design aprimorado
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, currentY, 180, 55, 8, 8, 'F');
    
    // Borda sutil com sombra
    doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, currentY, 180, 55, 8, 8, 'S');
    
    // Sombra do card
    doc.setFillColor(0, 0, 0, 0.05);
    doc.roundedRect(17, currentY + 2, 180, 55, 8, 8, 'F');
    
    // Faixa superior do card
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(15, currentY, 180, 12, 8, 8, 'F');
    doc.rect(15, currentY + 6, 180, 6, 'F');
    
    // Título do resumo com melhor posicionamento
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', 105, currentY + 8, { align: 'center' });
    
    // Cards de valores com design aprimorado
    const cardWidth = 52;
    const cardHeight = 32;
    const cardY = currentY + 18;
    const cardSpacing = 4;
    
    // Card Entradas
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(23, cardY, cardWidth, cardHeight, 5, 5, 'F');
    doc.setFillColor(successColor[0], successColor[1], successColor[2], 0.08);
    doc.roundedRect(23, cardY, cardWidth, cardHeight, 5, 5, 'F');
    doc.setDrawColor(successColor[0], successColor[1], successColor[2], 0.3);
    doc.setLineWidth(0.5);
    doc.roundedRect(23, cardY, cardWidth, cardHeight, 5, 5, 'S');
    
    // Ícone visual para entradas
    doc.setFillColor(successColor[0], successColor[1], successColor[2]);
    doc.circle(35, cardY + 8, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('+', 35, cardY + 9.5, { align: 'center' });
    
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ENTRADAS', 49, cardY + 9, { align: 'center' });
    doc.setFontSize(11);
    doc.text(formatCurrency(totalIncome), 49, cardY + 22, { align: 'center' });
    
    // Card Saídas
    const cardX2 = 23 + cardWidth + cardSpacing;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX2, cardY, cardWidth, cardHeight, 5, 5, 'F');
    doc.setFillColor(dangerColor[0], dangerColor[1], dangerColor[2], 0.08);
    doc.roundedRect(cardX2, cardY, cardWidth, cardHeight, 5, 5, 'F');
    doc.setDrawColor(dangerColor[0], dangerColor[1], dangerColor[2], 0.3);
    doc.setLineWidth(0.5);
    doc.roundedRect(cardX2, cardY, cardWidth, cardHeight, 5, 5, 'S');
    
    // Ícone visual para saídas
    doc.setFillColor(dangerColor[0], dangerColor[1], dangerColor[2]);
    doc.circle(cardX2 + 12, cardY + 8, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('-', cardX2 + 12, cardY + 9.5, { align: 'center' });
    
    doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SAÍDAS', cardX2 + 26, cardY + 9, { align: 'center' });
    doc.setFontSize(11);
    doc.text(formatCurrency(Math.abs(totalExpense)), cardX2 + 26, cardY + 22, { align: 'center' });
    
    // Card Saldo
    const cardX3 = cardX2 + cardWidth + cardSpacing;
    const balanceColor = balance >= 0 ? successColor : dangerColor;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX3, cardY, cardWidth, cardHeight, 5, 5, 'F');
    doc.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2], 0.08);
    doc.roundedRect(cardX3, cardY, cardWidth, cardHeight, 5, 5, 'F');
    doc.setDrawColor(balanceColor[0], balanceColor[1], balanceColor[2], 0.3);
    doc.setLineWidth(0.5);
    doc.roundedRect(cardX3, cardY, cardWidth, cardHeight, 5, 5, 'S');
    
    // Ícone visual para saldo
    doc.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.circle(cardX3 + 12, cardY + 8, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('=', cardX3 + 12, cardY + 9.5, { align: 'center' });
    
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SALDO', cardX3 + 26, cardY + 9, { align: 'center' });
    doc.setFontSize(11);
    doc.text(formatCurrency(balance), cardX3 + 26, cardY + 22, { align: 'center' });
    
    currentY += 80;
    
    // Função para renderizar seção de categoria
    function renderCategorySection(groups, sectionTitle, sectionColor, isIncome = false) {
        checkPageBreak(30);
        
        // Título da seção com design aprimorado
        doc.setFillColor(sectionColor[0], sectionColor[1], sectionColor[2]);
        doc.roundedRect(15, currentY, 180, 25, 6, 6, 'F');
        
        // Faixa decorativa lateral
        doc.setFillColor(255, 255, 255, 0.2);
        doc.rect(15, currentY, 6, 25, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(sectionTitle, 30, currentY + 16);
        
        currentY += 35;
        
        // Renderizar cada grupo
        Object.keys(groups).forEach((groupKey, index) => {
            const group = groups[groupKey];
            
            // Calcular total de transações no grupo
            const totalTransactions = Object.values(group.subcategories).reduce((sum, sub) => sum + sub.transactions.length, 0);
            
            checkPageBreak(40 + (totalTransactions * 8));
            
            // Cabeçalho do grupo com design melhorado
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(20, currentY, 170, 30, 6, 6, 'F');
            doc.setFillColor(group.color[0], group.color[1], group.color[2], 0.06);
            doc.roundedRect(20, currentY, 170, 30, 6, 6, 'F');
            doc.setDrawColor(group.color[0], group.color[1], group.color[2], 0.4);
            doc.setLineWidth(0.5);
            doc.roundedRect(20, currentY, 170, 30, 6, 6, 'S');
            
            // Indicador visual da categoria
            doc.setFillColor(group.color[0], group.color[1], group.color[2]);
            doc.roundedRect(25, currentY + 8, 4, 14, 2, 2, 'F');
            
            // Nome do grupo com melhor tipografia
            doc.setTextColor(group.color[0], group.color[1], group.color[2]);
            doc.setFontSize(15);
            doc.setFont('helvetica', 'bold');
            doc.text(group.name, 35, currentY + 12);
            
            // Total do grupo com destaque
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total: ${formatCurrency(group.total)}`, 35, currentY + 23);
            
            // Badge com quantidade de transações
            const badgeText = `${totalTransactions} item${totalTransactions !== 1 ? 's' : ''}`;
            const badgeWidth = doc.getTextWidth(badgeText) + 8;
            doc.setFillColor(group.color[0], group.color[1], group.color[2], 0.15);
            doc.roundedRect(185 - badgeWidth, currentY + 8, badgeWidth, 14, 7, 7, 'F');
            doc.setTextColor(group.color[0], group.color[1], group.color[2]);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(badgeText, 185 - badgeWidth/2, currentY + 16, { align: 'center' });
            
            currentY += 40;
            
            // Renderizar cada subcategoria
            Object.keys(group.subcategories).forEach((subcategoryName, subIndex) => {
                const subcategory = group.subcategories[subcategoryName];
                
                checkPageBreak(25 + (subcategory.transactions.length * 8));
                
                // Cabeçalho da subcategoria
                doc.setFillColor(group.color[0], group.color[1], group.color[2], 0.1);
                doc.roundedRect(25, currentY, 160, 20, 4, 4, 'F');
                doc.setDrawColor(group.color[0], group.color[1], group.color[2], 0.3);
                doc.setLineWidth(0.3);
                doc.roundedRect(25, currentY, 160, 20, 4, 4, 'S');
                
                // Indicador da subcategoria
                doc.setFillColor(group.color[0], group.color[1], group.color[2], 0.7);
                doc.roundedRect(30, currentY + 6, 3, 8, 1.5, 1.5, 'F');
                
                // Nome da subcategoria
                doc.setTextColor(group.color[0], group.color[1], group.color[2]);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(subcategoryName, 38, currentY + 10);
                
                // Total da subcategoria
                doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`${formatCurrency(subcategory.total)} (${subcategory.transactions.length} item${subcategory.transactions.length !== 1 ? 's' : ''})`, 38, currentY + 16);
                
                currentY += 25;
                
                // Tabela de transações da subcategoria
                if (subcategory.transactions.length > 0) {
                    const tableData = subcategory.transactions.map(transaction => {
                        // Combinar descrição com observações se existirem
                        let description = transaction.description;
                        if (transaction.notes && transaction.notes.trim() !== '') {
                            // Limitar o tamanho das observações e usar caracteres simples
                            let notes = transaction.notes.trim();
                            if (notes.length > 50) {
                                notes = notes.substring(0, 47) + '...';
                            }
                            description += `\n[Obs: ${notes}]`;
                        }
                        
                        return [
                            formatDate(transaction.date),
                            description,
                            formatCurrency(Math.abs(transaction.amount))
                        ];
                    });
                
                    doc.autoTable({
                        startY: currentY,
                        head: [['Data', 'Descrição', 'Valor']],
                        body: tableData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [group.color[0], group.color[1], group.color[2], 0.8],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 11,
                            halign: 'center',
                            valign: 'middle',
                            cellPadding: 4
                        },
                        bodyStyles: {
                            fontSize: 10,
                            textColor: [52, 58, 64],
                            cellPadding: 3,
                            lineColor: [220, 220, 220],
                            lineWidth: 0.2,
                            valign: 'middle'
                        },
                        columnStyles: {
                            0: { cellWidth: 35, halign: 'center', valign: 'middle', fontStyle: 'normal' },
                            1: { cellWidth: 85, valign: 'middle', cellPadding: { left: 4, right: 4 } },
                            2: { cellWidth: 35, halign: 'right', valign: 'middle', fontStyle: 'bold', textColor: group.color }
                        },
                        alternateRowStyles: {
                            fillColor: [252, 253, 254]
                        },
                        styles: {
                            cellPadding: 3,
                            fontSize: 10
                        },
                        margin: { left: 30, right: 30 },
                        didDrawPage: function(data) {
                            currentY = data.cursor.y;
                        }
                    });
                    
                    currentY = doc.previousAutoTable.finalY + 10;
                }
            });
            
            currentY += 15;
        });
    }
    
    // Renderizar seções
    if (Object.keys(incomeGroups).length > 0) {
        renderCategorySection(incomeGroups, 'RECEITAS POR CATEGORIA', successColor, true);
    }
    
    if (Object.keys(expenseGroups).length > 0) {
        renderCategorySection(expenseGroups, 'DESPESAS POR CATEGORIA', dangerColor, false);
    }
    
    // Rodapé personalizado para todas as páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Rodapé com design aprimorado
        // Linha decorativa dupla
        doc.setDrawColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        doc.setLineWidth(0.5);
        doc.line(15, 278, 195, 278);
        doc.setLineWidth(0.3);
        doc.line(15, 280, 195, 280);
        
        // Fundo sutil do rodapé
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(0, 282, doc.internal.pageSize.getWidth(), 15, 'F');
        
        // Informações do rodapé com melhor tipografia
        doc.setFontSize(9);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.text('Controle Financeiro Inteligente', 20, 289);
        
        // Numeração de página com estilo
        doc.setFont('helvetica', 'bold');
        doc.text(`${i}`, 185, 289, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`de ${pageCount}`, 190, 289, { align: 'center' });
    }
    
    // Salvar o PDF com nome personalizado
    doc.save(`relatorio_detalhado_${monthNames[month]}_${year}.pdf`);
}

// Inicializar a aplicação
loadCategories('income'); // Carregar categorias de entrada por padrão
updateFilterCategories(); // Inicializar filtro de categorias
initializeCategoryElements(); // Inicializar elementos de categoria

// Manipular logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log('Logout bem-sucedido');
        window.location.href = 'welcome.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    }
});

// Carregar dados do Firestore quando o app iniciar
document.addEventListener('DOMContentLoaded', loadTransactionsFromFirestore);