/* ============================================
   Реестр судей — загрузка CSV и фильтрация
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('registry-body');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const countEl = document.getElementById('registry-count');

    let allJudges = [];
    let currentFilter = 'all';
    let currentSearch = '';

    // Загрузка CSV
    fetch('./data/judges.csv')
        .then(r => {
            if (!r.ok) throw new Error('CSV не найден');
            return r.text();
        })
        .then(text => {
            allJudges = parseCSV(text);
            render();
        })
        .catch(err => {
            console.warn('Ошибка загрузки CSV:', err);
            // Демо-данные если CSV недоступен
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

    function parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const out = [];
        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            if (row.length < headers.length) continue;
            const obj = {};
            headers.forEach((h, idx) => obj[h] = row[idx] || '');
            out.push(obj);
        }
        return out;
    }

    function parseCSVLine(line) {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(cur.trim());
                cur = '';
            } else {
                cur += ch;
            }
        }
        result.push(cur.trim());
        return result;
    }

    function getDemoData() {
        return [
            {ФИО:'Иванов Сергей Петрович', Регион:'Москва', Категория:'Высшая', Дата_присвоения:'15.03.2022', Номер_документа:'ВС-2022-015', Статус:'Судейский комитет'},
            {ФИО:'Петров Алексей Викторович', Регион:'Санкт-Петербург', Категория:'Первая', Дата_присвоения:'22.07.2023', Номер_документа:'П-2023-042', Статус:'Действует'},
            {ФИО:'Сидоров Максим Константинович', Регион:'Новосибирская обл.', Категория:'Вторая', Дата_присвоения:'10.11.2024', Номер_документа:'ВТ-2024-089', Статус:'Приостановлена'},
            {ФИО:'Козлова Елена Дмитриевна', Регион:'Респ. Татарстан', Категория:'Первая', Дата_присвоения:'05.05.2021', Номер_документа:'П-2021-031', Статус:'Действует'},
            {ФИО:'Морозов Денис Игоревич', Регион:'Краснодарский край', Категория:'Высшая', Дата_присвоения:'18.09.2020', Номер_документа:'ВС-2020-008', Статус:'Судейский комитет'},
            {ФИО:'Волков Артём Сергеевич', Регион:'Свердловская обл.', Категория:'Третья', Дата_присвоения:'12.01.2025', Номер_документа:'Т-2025-003', Статус:'Действует'},
            {ФИО:'Лебедева Анна Павловна', Регион:'Москва', Категория:'Первая', Дата_присвоения:'30.06.2022', Номер_документа:'П-2022-056', Статус:'Действует'},
            {ФИО:'Семёнов Илья Андреевич', Регион:'Ростовская обл.', Категория:'Вторая', Дата_присвоения:'14.08.2023', Номер_документа:'ВТ-2023-067', Статус:'Приостановлена'},
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
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--fk-text-muted);">Ничего не найдено</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map(j => `
            <tr>
                <td><strong>${j.ФИО || ''}</strong></td>
                <td>${j.Регион || ''}</td>
                <td>${j.Категория || ''}</td>
                <td>${j.Дата_присвоения || ''}</td>
                <td>${j.Номер_документа || ''}</td>
                <td><span class="${getBadgeClass(j.Статус)}">${j.Статус || '—'}</span></td>
            </tr>
        `).join('');
    }
});

// Мобильное меню
function toggleMenu() {
    document.querySelector('.nav').classList.toggle('open');
}
