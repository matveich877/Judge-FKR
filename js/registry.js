/* ============================================
     Реестр судей — загрузка JSON и фильтрация
     ============================================ */
    
    document.addEventListener('DOMContentLoaded', function() {
        const tableBody = document.getElementById('registry-body');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('search-input');
        const countEl = document.getElementById('registry-count');
    
        let allJudges = [];
        let currentFilter = 'all';
        let currentSearch = '';
    
        // Загрузка JSON
        fetch('./data/judges.json')
            .then(r => {
                if (!r.ok) throw new Error('JSON не найден');
                return r.json();
            })
            .then(data => {
                allJudges = data;
                render();
            })
            .catch(err => {
                console.warn('Ошибка загрузки JSON:', err);
                allJudges = getDemoData();
                render();
            });
    
        // Фильтры по категории/статусу
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                render();
            });
        });
    
        // Поиск
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase();
                render();
            });
        }
    
        function getDemoData() {
            return [
                {ФИО:'Иванов Сергей Петрович', Регион:'Москва', Категория:'Высшая', Дата_присвоения:'15.03.2022', Статус:'Судейский комитет'},
                {ФИО:'Петров Алексей Викторович', Регион:'Санкт-Петербург', Категория:'Первая', Дата_присвоения:'22.07.2023', Статус:'Действует'},
            ];
        }
    
        function getBadgeClass(status) {
            const s = (status || '').toLowerCase();
            if (s.includes('комитет')) return 'badge committee';
            if (s.includes('приостанов')) return 'badge red';
            if (s.includes('лишен')) return 'badge red';
            if (s.includes('действ')) return 'badge green';
            return 'badge gray';
        }
    
        function render() {
            if (!tableBody) return;
    
            let filtered = allJudges.filter(j => {
                const matchFilter = currentFilter === 'all' ||
                    (currentFilter === 'committee' && (j.Статус || '').toLowerCase().includes('комитет')) ||
                    (currentFilter === 'active' && (j.Статус || '').toLowerCase().includes('действ')) ||
                    (currentFilter === 'suspended' && ((j.Статус || '').toLowerCase().includes('приостанов') || (j.Статус || '').toLowerCase().includes('лишен')));
    
                const matchSearch = !currentSearch ||
                    (j.ФИО || '').toLowerCase().includes(currentSearch) ||
                    (j.Регион || '').toLowerCase().includes(currentSearch) ||
                    (j.Категория || '').toLowerCase().includes(currentSearch);
    
                return matchFilter && matchSearch;
            });
    
            if (countEl) countEl.textContent = `Показано: ${filtered.length} из ${allJudges.length}`;
    
            if (filtered.length === 0) {
                tableBody.innerHTML = 'Ничего не найдено';
                return;
            }
    
            tableBody.innerHTML = filtered.map(j => `
                <tr>
                    <td><strong>${j.ФИО || ''}</strong></td>
                    <td>${j.Регион || ''}</td>
                    <td>${j.Категория || ''}</td>
                    <td>${j.КУМИТЭ || ''}</td>
                    <td>${j.КАТА || ''}</td>
                    <td>${j.Дата_присвоения || ''}</td>
                    <td>${j.Дата_продления || ''}</td>
                    <td><span class="${getBadgeClass(j.Статус)}">${j.Статус || '—'}</span></td>
                </tr>
            `).join('');
        }
    });
    
    function toggleMenu() {
        document.querySelector('.nav').classList.toggle('open');
    }
    