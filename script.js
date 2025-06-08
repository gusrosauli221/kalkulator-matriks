// Memastikan semua elemen HTML sudah dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', () => {

    // Dapatkan referensi ke elemen-elemen HTML utama
    const determinantModeBtn = document.getElementById('determinantModeBtn');
    const operationModeBtn = document.getElementById('operationModeBtn');

    const determinantSection = document.getElementById('determinantSection');
    const operationSection = document.getElementById('operationSection');

    const detMatrixOrderInput = document.getElementById('detMatrixOrder');
    const opMatrixCountSelect = document.getElementById('opMatrixCount');
    const opMatrixOrderInput = document.getElementById('opMatrixOrder');
    const opMatrixOperationTypeSelect = document.getElementById('matrixOperationType'); // Pastikan ini ada

    const detMatrixInputContainer = document.getElementById('detMatrixInputContainer');
    const opMatrixInputContainer = document.getElementById('opMatrixInputContainer');

    const calculateDeterminantBtn = document.getElementById('calculateDeterminantBtn');
    const calculateOperationBtn = document.getElementById('calculateOperationBtn');

    const detWarningText = document.getElementById('detWarning');
    const opWarningText = document.getElementById('opWarning');

    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultArea = document.getElementById('resultArea');
    const finalResultDisplay = document.getElementById('finalResultDisplay');
    const resultContent = document.getElementById('resultContent');

    const detCalculationDetails = document.getElementById('detCalculationDetails');
    const opCalculationDetails = document.getElementById('opCalculationDetails');
    const minorCofactorMethodBtn = document.getElementById('minorCofactorMethodBtn');
    const sarrusMethodBtn = document.getElementById('sarrusMethodBtn');
    const minorCofactorSteps = document.getElementById('minorCofactorSteps');
    const sarrusSteps = document.getElementById('sarrusSteps');
    const operationSteps = document.getElementById('operationSteps');


    // --- Fungsi Pembantu ---
    function showElement(element) {
        if (element) element.style.display = 'block';
    }

    function hideElement(element) {
        if (element) element.style.display = 'none';
    }

    function clearContainer(container) {
        if (container) container.innerHTML = '';
    }

    function displayWarning(element, message) {
        if (element) {
            element.textContent = message;
            showElement(element);
            setTimeout(() => {
                if (element) hideElement(element); 
            }, 5000); 
        }
    }

    /**
     * Fungsi untuk memformat angka agar tidak menampilkan .0000 jika bilangan bulat.
     * @param {number} number Angka yang akan diformat.
     * @returns {string} String angka yang sudah diformat.
     */
    function formatNumberForDisplay(number) {
        if (typeof number !== 'number' || isNaN(number)) {
            console.warn("Attempted to format non-numeric or NaN value:", number);
            return String(number); 
        }
        if (Math.abs(number - Math.round(number)) < 1e-9) { 
            return Math.round(number).toString(); 
        }
        return number.toFixed(4); 
    }


    /**
     * Membuat representasi HTML dari matriks.
     * @param {Array<Array<number>>} matrix Matriks yang akan ditampilkan.
     * @param {string} displayType 'input' atau 'output' untuk styling yang berbeda.
     * @returns {string} HTML string dari matriks.
     */
    function createMatrixHTML(matrix, displayType = 'output') {
        if (!matrix || !Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
            console.error("Invalid matrix provided to createMatrixHTML:", matrix);
            return '<p class="warning-text">Matriks tidak valid untuk ditampilkan.</p>'; 
        }
        const rows = matrix.length;
        const cols = matrix[0].length;
        let html = '';
        const cellClass = (displayType === 'input') ? 'matrix-cell-input' : 'matrix-cell-display';
        const containerClass = (displayType === 'input') ? 'matrix-container' : 'matrix-display-container';
        const gridClass = (displayType === 'input') ? 'matrix-grid' : 'matrix-display-grid';

        html += `<div class="${containerClass}">`;
        html += `<div class="${gridClass}" style="grid-template-columns: repeat(${cols}, 1fr);">`;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cellValue = formatNumberForDisplay(matrix[i][j]);
                html += `<div class="${cellClass}">${cellValue}</div>`;
            }
        }
        html += `</div>`; 
        html += `</div>`; 
        return html;
    }


    // --- Fungsi untuk Mengganti Mode (Determinan / Operasi) ---
    function switchMode(mode) {
        hideElement(determinantSection);
        hideElement(operationSection);
        hideElement(resultArea); 
        hideElement(detCalculationDetails); 
        hideElement(opCalculationDetails); 

        if (determinantModeBtn) determinantModeBtn.classList.remove('active');
        if (operationModeBtn) operationModeBtn.classList.remove('active');

        if (mode === 'determinant') {
            showElement(determinantSection);
            if (determinantModeBtn) determinantModeBtn.classList.add('active');
            clearContainer(detMatrixInputContainer); 
            hideElement(calculateDeterminantBtn); 
            hideElement(detWarningText); 
            if (detMatrixOrderInput) detMatrixOrderInput.value = 3; 
            createMatrixInputs('determinant'); 
        } else if (mode === 'operation') {
            showElement(operationSection);
            if (operationModeBtn) operationModeBtn.classList.add('active');
            clearContainer(opMatrixInputContainer); 
            hideElement(calculateOperationBtn); 
            hideElement(opWarningText); 
            if (opMatrixOrderInput) opMatrixOrderInput.value = 3; 
            if (opMatrixCountSelect) opMatrixCountSelect.value = 'two'; 
            if (opMatrixOperationTypeSelect) opMatrixOperationTypeSelect.value = 'add'; 
            createMatrixInputs('operation'); 
        }
    }

    // --- Fungsi untuk Membuat Input Matriks (Sesuai mode baru) ---
    function createMatrixInputs(mode) {
        console.log(`[createMatrixInputs] Mode: ${mode}`); 
        let order;
        let container;
        let numMatrices = 1; 
        let warningElement;
        let calculateBtn;

        if (mode === 'determinant') {
            order = detMatrixOrderInput ? parseInt(detMatrixOrderInput.value) : NaN;
            container = detMatrixInputContainer;
            warningElement = detWarningText;
            calculateBtn = calculateDeterminantBtn;
        } else if (mode === 'operation') {
            order = opMatrixOrderInput ? parseInt(opMatrixOrderInput.value) : NaN;
            container = opMatrixInputContainer;
            numMatrices = (opMatrixCountSelect && opMatrixCountSelect.value === 'two') ? 2 : 3;
            warningElement = opWarningText;
            calculateBtn = calculateOperationBtn;
        } else {
            console.error("Invalid mode for createMatrixInputs:", mode);
            return;
        }

        if (isNaN(order) || order < 2 || order > (mode === 'determinant' ? 5 : 4)) {
            displayWarning(warningElement, `Ordo matriks harus antara 2 dan ${mode === 'determinant' ? '5' : '4'}.`);
            clearContainer(container); 
            hideElement(calculateBtn); 
            console.log(`[createMatrixInputs] Invalid order: ${order}`); 
            return;
        }

        clearContainer(container);
        hideElement(warningElement);
        hideElement(resultArea); 
        hideElement(detCalculationDetails); 
        hideElement(opCalculationDetails); 

        for (let m = 0; m < numMatrices; m++) {
            const matrixLabel = String.fromCharCode(65 + m); 
            const matrixDiv = document.createElement('div');
            matrixDiv.classList.add('matrix-container'); 
            matrixDiv.setAttribute('data-matrix-id', matrixLabel); 

            const label = document.createElement('label');
            label.textContent = `Matriks ${matrixLabel}:`;
            matrixDiv.appendChild(label);

            const gridDiv = document.createElement('div');
            gridDiv.classList.add('matrix-grid');
            gridDiv.style.gridTemplateColumns = `repeat(${order}, 1fr)`;

            for (let i = 0; i < order; i++) {
                for (let j = 0; j < order; j++) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.classList.add('matrix-cell-input');
                    input.setAttribute('data-row', i);
                    input.setAttribute('data-col', j);
                    input.id = `${mode === 'determinant' ? 'det' : 'op'}-matrix-${matrixLabel}-${i}-${j}`;
                    gridDiv.appendChild(input);
                }
            }
            matrixDiv.appendChild(gridDiv);
            if (container) { 
                container.appendChild(matrixDiv);
            } else {
                console.error(`[createMatrixInputs] Target container is null for mode ${mode}.`);
                return; 
            }
        }
        if (calculateBtn) { 
            showElement(calculateBtn); 
        } else {
            console.error(`[createMatrixInputs] Calculate button is null for mode ${mode}.`);
        }
        console.log(`[createMatrixInputs] Matriks input untuk mode ${mode} dengan ordo ${order} dibuat.`); 
    }

    // --- Fungsi untuk Mengambil Data Matriks dari Input ---
    function getMatrixFromInputs(containerId, order, numMatrices = 1) {
        console.log(`[getMatrixFromInputs] Mencoba mengambil input dari container: ${containerId}, order: ${order}, numMatrices: ${numMatrices}`); 
        const matrices = [];
        for (let m = 0; m < numMatrices; m++) {
            const matrix = [];
            const matrixLabel = String.fromCharCode(65 + m);
            for (let i = 0; i < order; i++) {
                const row = [];
                for (let j = 0; j < order; j++) {
                    const inputId = `${containerId === 'detMatrixInputContainer' ? 'det' : 'op'}-matrix-${matrixLabel}-${i}-${j}`;
                    const inputElement = document.getElementById(inputId);
                    
                    if (inputElement) { 
                        if (inputElement.value !== '') { 
                            const value = parseFloat(inputElement.value);
                            if (isNaN(value)) {
                                console.error(`[getMatrixFromInputs] Input non-numeric found at ${inputId}: ${inputElement.value}`);
                                return null; 
                            }
                            row.push(value);
                        } else {
                            console.warn(`[getMatrixFromInputs] Empty input at ${inputId}`);
                            displayWarning(containerId === 'detMatrixInputContainer' ? detWarningText : opWarningText, `Mohon lengkapi semua elemen matriks. Input di ${inputId} kosong.`);
                            return null; 
                        }
                    } else {
                        console.error(`[getMatrixFromInputs] Element not found for ID: ${inputId}. This is likely the root cause if no inputs were created or their IDs are mismatched.`);
                        displayWarning(containerId === 'detMatrixInputContainer' ? detWarningText : opWarningText, `Error: Elemen input matriks tidak ditemukan (ID: ${inputId}). Pastikan ordo matriks telah dibuat.`);
                        return null; 
                    }
                }
                matrix.push(row);
            }
            matrices.push(matrix);
        }
        console.log(`[getMatrixFromInputs] Berhasil mengambil ${matrices.length} matriks.`); 
        return matrices;
    }

    // --- Event Listeners untuk Tombol Utama ---
    if (determinantModeBtn) {
        determinantModeBtn.addEventListener('click', () => switchMode('determinant'));
    }
    if (operationModeBtn) {
        operationModeBtn.addEventListener('click', () => switchMode('operation'));
    }


    // --- Logika Perhitungan Determinan ---
    if (calculateDeterminantBtn) {
        calculateDeterminantBtn.addEventListener('click', () => {
            console.log('[calculateDeterminantBtn] Tombol Hitung Determinan diklik.'); 
            const order = detMatrixOrderInput ? parseInt(detMatrixOrderInput.value) : NaN;

            if (isNaN(order)) {
                displayWarning(detWarningText, 'Ordo matriks tidak valid. Mohon masukkan angka.');
                console.warn('[calculateDeterminantBtn] Ordo tidak valid.');
                return;
            }

            const matrices = getMatrixFromInputs('detMatrixInputContainer', order);

            if (!matrices || matrices.length === 0 || !matrices[0]) {
                displayWarning(detWarningText, 'Mohon lengkapi semua elemen matriks dengan angka yang valid.');
                console.warn('[calculateDeterminantBtn] Matriks tidak valid atau kosong.'); 
                return;
            }

            showElement(loadingIndicator);
            hideElement(finalResultDisplay);
            hideElement(detCalculationDetails);
            hideElement(opCalculationDetails); 

            setTimeout(() => { 
                hideElement(loadingIndicator);
                showElement(resultArea);

                let determinantValue;
                let stepsHTMLMinorCofactor = '';
                let stepsHTMLSarrus = '';

                try {
                    determinantValue = calculateDeterminantMinorCofactor(matrices[0], (stepHtml) => {
                        stepsHTMLMinorCofactor += stepHtml;
                    });

                    if (order === 3) {
                        const sarrusMatrix = matrices[0];
                        const term1_pos = sarrusMatrix[0][0] * sarrusMatrix[1][1] * sarrusMatrix[2][2];
                        const term2_pos = sarrusMatrix[0][1] * sarrusMatrix[1][2] * sarrusMatrix[2][0];
                        const term3_pos = sarrusMatrix[0][2] * sarrusMatrix[1][0] * sarrusMatrix[2][1];
                        const sum_positive = term1_pos + term2_pos + term3_pos;

                        const term1_neg = sarrusMatrix[0][2] * sarrusMatrix[1][1] * sarrusMatrix[2][0];
                        const term2_neg = sarrusMatrix[0][0] * sarrusMatrix[1][2] * sarrusMatrix[2][1];
                        const term3_neg = sarrusMatrix[0][1] * sarrusMatrix[1][0] * sarrusMatrix[2][2];
                        const sum_negative = term1_neg + term2_neg + term3_neg;

                        const sarrusDetResult = sum_positive - sum_negative;

                        stepsHTMLSarrus = `
                            <div class="calculation-step">
                                <div class="step-header">Metode Sarrus (Khusus 3x3)</div>
                                <p class="explanation-text">Untuk matriks 3x3, kita mereplikasi dua kolom pertama di sebelah kanan matriks untuk membantu visualisasi perkalian diagonal.</p>
                                <div class="sarrus-diagram">
                                    <div class="sarrus-matrix matrix-display-grid" style="grid-template-columns: repeat(3, 1fr);">
                                        ${sarrusMatrix.map(row => row.map(cell => `<div class="matrix-cell-display">${formatNumberForDisplay(cell)}</div>`).join('')).join('')}
                                    </div>
                                    <div class="sarrus-replicated-cols matrix-display-grid" style="grid-template-columns: repeat(2, 1fr);">
                                        <div class="matrix-cell-display">${formatNumberForDisplay(sarrusMatrix[0][0])}</div><div class="matrix-cell-display">${formatNumberForDisplay(sarrusMatrix[0][1])}</div>
                                        <div class="matrix-cell-display">${formatNumberForDisplay(sarrusMatrix[1][0])}</div><div class="matrix-cell-display">${formatNumberForDisplay(sarrusMatrix[1][1])}</div>
                                        <div class="matrix-cell-display">${formatNumberForDisplay(sarrusMatrix[2][0])}</div><div class="matrix-cell-display">${formatNumberForDisplay(sarrusMatrix[2][1])}</div>
                                    </div>
                                </div>
                                <p class="explanation-text">Jumlahkan perkalian diagonal turun (positif) dan kurangkan dengan perkalian diagonal naik (negatif).</p>
                                <div class="minor-calculation-steps">
                                    <p><strong>Perkalian Diagonal Positif:</strong></p>
                                    <p>(${formatNumberForDisplay(sarrusMatrix[0][0])} &times; ${formatNumberForDisplay(sarrusMatrix[1][1])} &times; ${formatNumberForDisplay(sarrusMatrix[2][2])}) = ${formatNumberForDisplay(term1_pos)}</p>
                                    <p>(${formatNumberForDisplay(sarrusMatrix[0][1])} &times; ${formatNumberForDisplay(sarrusMatrix[1][2])} &times; ${formatNumberForDisplay(sarrusMatrix[2][0])}) = ${formatNumberForDisplay(term2_pos)}</p>
                                    <p>(${formatNumberForDisplay(sarrusMatrix[0][2])} &times; ${formatNumberForDisplay(sarrusMatrix[1][0])} &times; ${formatNumberForDisplay(sarrusMatrix[2][1])}) = ${formatNumberForDisplay(term3_pos)}</p>
                                    <p>Total Positif = ${formatNumberForDisplay(term1_pos)} + ${formatNumberForDisplay(term2_pos)} + ${formatNumberForDisplay(term3_pos)} = <span class="step-final-term-value">${formatNumberForDisplay(sum_positive)}</span></p>
                                    <br>
                                    <p><strong>Perkalian Diagonal Negatif:</strong></p>
                                    <p>(${formatNumberForDisplay(sarrusMatrix[0][2])} &times; ${formatNumberForDisplay(sarrusMatrix[1][1])} &times; ${formatNumberForDisplay(sarrusMatrix[2][0])}) = ${formatNumberForDisplay(term1_neg)}</p>
                                    <p>(${formatNumberForDisplay(sarrusMatrix[0][0])} &times; ${formatNumberForDisplay(sarrusMatrix[1][2])} &times; ${formatNumberForDisplay(sarrusMatrix[2][1])}) = ${formatNumberForDisplay(term2_neg)}</p>
                                    <p>(${formatNumberForDisplay(sarrusMatrix[0][1])} &times; ${formatNumberForDisplay(sarrusMatrix[1][0])} &times; ${formatNumberForDisplay(sarrusMatrix[2][2])}) = ${formatNumberForDisplay(term3_neg)}</p>
                                    <p>Total Negatif = ${formatNumberForDisplay(term1_neg)} + ${formatNumberForDisplay(term2_neg)} + ${formatNumberForDisplay(term3_neg)} = <span class="step-final-term-value">${formatNumberForDisplay(sum_negative)}</span></p>
                                    <br>
                                    <p class="step-final-term-value">Determinan = ${formatNumberForDisplay(sum_positive)} - ${formatNumberForDisplay(sum_negative)} = ${formatNumberForDisplay(sarrusDetResult)}</p>
                                </div>
                            </div>
                            <div class="final-sum-explanation">
                                <div class="step-header">Kesimpulan: Hasil Akhir Determinan dengan Metode Sarrus</div>
                                <p>Berdasarkan perhitungan metode Sarrus, determinan matriks adalah:</p>
                                <p class="result-value">${formatNumberForDisplay(sarrusDetResult)}</p>
                            </div>
                        `;
                        showElement(sarrusMethodBtn); 
                    } else {
                        hideElement(sarrusMethodBtn); 
                    }

                    resultContent.innerHTML = `
                        <p>Determinan Matriks adalah:</p>
                        <p class="result-value">${formatNumberForDisplay(determinantValue)}</p>
                    `;
                    showElement(finalResultDisplay);

                    minorCofactorSteps.innerHTML = stepsHTMLMinorCofactor;
                    sarrusSteps.innerHTML = stepsHTMLSarrus;

                    if (order === 3) {
                        if (minorCofactorMethodBtn) {
                            minorCofactorMethodBtn.classList.add('active');
                            showElement(minorCofactorSteps);
                        }
                        if (sarrusMethodBtn) sarrusMethodBtn.classList.remove('active');
                        hideElement(sarrusSteps);
                    } else {
                        if (minorCofactorMethodBtn) {
                            minorCofactorMethodBtn.classList.add('active');
                            showElement(minorCofactorSteps);
                        }
                        if (sarrusMethodBtn) sarrusMethodBtn.classList.remove('active'); 
                        hideElement(sarrusSteps);
                    }
                    showElement(detCalculationDetails);

                } catch (error) {
                    console.error("Error during determinant calculation:", error);
                    resultContent.innerHTML = `<p class="warning-text">Terjadi kesalahan dalam perhitungan determinan: ${error.message}</p>`;
                    hideElement(detCalculationDetails); 
                }


            }, 500); 
        });
    }


    // --- Logika Perhitungan Operasi Matriks ---
    if (calculateOperationBtn) {
        calculateOperationBtn.addEventListener('click', () => {
            console.log('[calculateOperationBtn] Tombol Hitung Operasi diklik.'); 
            const numMatrices = (opMatrixCountSelect && opMatrixCountSelect.value === 'two') ? 2 : 3;
            const order = opMatrixOrderInput ? parseInt(opMatrixOrderInput.value) : NaN;

            // ***** BARIS BARU UNTUK MEMPERBAIKI ERROR *****
            const operationType = opMatrixOperationTypeSelect ? opMatrixOperationTypeSelect.value : ''; 
            // ********************************************

            if (isNaN(order)) {
                displayWarning(opWarningText, 'Ordo matriks tidak valid. Mohon masukkan angka.');
                console.warn('[calculateOperationBtn] Ordo tidak valid.');
                return;
            }

            const matrices = getMatrixFromInputs('opMatrixInputContainer', order, numMatrices);

            if (!matrices || matrices.length === 0 || !matrices[0]) {
                displayWarning(opWarningText, 'Mohon lengkapi semua elemen matriks dengan angka yang valid.');
                console.warn('[calculateOperationBtn] Matriks tidak valid atau kosong.'); 
                return;
            }

            showElement(loadingIndicator);
            hideElement(finalResultDisplay);
            hideElement(detCalculationDetails);
            hideElement(opCalculationDetails);

            setTimeout(() => { 
                hideElement(loadingIndicator);
                showElement(resultArea);

                let resultMatrix;
                let operationStepsHTML = '';

                try {
                    if (operationType === 'add') {
                        operationStepsHTML += `<div class="calculation-step"><div class="step-header">Operasi Penjumlahan Matriks</div></div>`;
                        resultMatrix = addMatrices(matrices, (stepHtml) => {
                            operationStepsHTML += stepHtml;
                        });
                    } else if (operationType === 'subtract') {
                        operationStepsHTML += `<div class="calculation-step"><div class="step-header">Operasi Pengurangan Matriks</div></div>`;
                        resultMatrix = subtractMatrices(matrices, (stepHtml) => {
                            operationStepsHTML += stepHtml;
                        });
                    } else if (operationType === 'multiply') {
                        operationStepsHTML += `<div class="calculation-step"><div class="step-header">Operasi Perkalian Matriks</div></div>`;
                        resultMatrix = multiplyMatrices(matrices, (stepHtml) => {
                            operationStepsHTML += stepHtml;
                        });
                    } else { // Handle case where operationType might be empty or invalid
                        throw new Error("Jenis operasi matriks tidak valid atau tidak dipilih.");
                    }

                    if (resultMatrix && Array.isArray(resultMatrix) && resultMatrix.length > 0 && Array.isArray(resultMatrix[0])) {
                        let matrixDisplayHTML = createMatrixHTML(resultMatrix, 'output'); 

                        resultContent.innerHTML = `
                            <p>Hasil Operasi Matriks:</p>
                            ${matrixDisplayHTML}
                        `;

                        operationStepsHTML += `
                            <div class="final-sum-explanation">
                                <div class="step-header">Kesimpulan: Hasil Akhir Operasi Matriks</div>
                                <p>Matriks hasil dari operasi ini adalah:</p>
                                ${matrixDisplayHTML}
                            </div>
                        `;

                    } else {
                        resultContent.innerHTML = `<p class="warning-text">Hasil operasi tidak valid atau kosong.</p>`;
                        console.warn("Operation resulted in invalid or empty matrix:", resultMatrix);
                    }
                } catch (error) {
                    resultContent.innerHTML = `<p class="warning-text">Error: ${error.message}</p>`;
                    console.error("Calculation Error:", error);
                    operationStepsHTML += `<div class="calculation-step warning-text">Error dalam perhitungan: ${error.message}</div>`;
                }

                showElement(finalResultDisplay);
                operationSteps.innerHTML = operationStepsHTML;
                showElement(opCalculationDetails);

            }, 500);
        });
    }


    // Event listener untuk tombol metode determinan
    if (minorCofactorMethodBtn) {
        minorCofactorMethodBtn.addEventListener('click', () => {
            minorCofactorMethodBtn.classList.add('active');
            if (sarrusMethodBtn) sarrusMethodBtn.classList.remove('active');
            showElement(minorCofactorSteps);
            hideElement(sarrusSteps);
        });
    }

    if (sarrusMethodBtn) {
        sarrusMethodBtn.addEventListener('click', () => {
            sarrusMethodBtn.classList.add('active');
            if (minorCofactorMethodBtn) minorCofactorMethodBtn.classList.remove('active');
            showElement(sarrusSteps);
            hideElement(minorCofactorSteps);
        });
    }

    // --- Fungsi-fungsi perhitungan matriks ---

    /**
     * Fungsi untuk menghitung determinan dengan metode Minor Kofaktor.
     * Parameter `addStep` adalah callback untuk menambahkan langkah-langkah ke UI.
     */
    function calculateDeterminantMinorCofactor(matrix, addStep) {
        if (!matrix || !Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
            throw new Error("Matriks tidak valid untuk perhitungan determinan.");
        }

        const order = matrix.length;

        if (order === 1) {
            const det = matrix[0][0];
            addStep(`
                <div class="calculation-step">
                    <div class="step-header">Determinan Matriks 1x1</div>
                    <p class="explanation-text">Determinan matriks 1x1 adalah elemen itu sendiri.</p>
                    <div class="minor-calculation-steps">
                        <p>Determinan = <span class="step-final-term-value">${formatNumberForDisplay(det)}</span></p>
                    </div>
                </div>
            `);
            return det;
        }
        if (order === 2) {
            const det = (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
            addStep(`
                <div class="calculation-step">
                    <div class="step-header">Perhitungan Determinan 2x2</div>
                    <p class="explanation-text">Determinan matriks 2x2 dihitung dengan rumus: (a &times; d) - (b &times; c).</p>
                    <div class="minor-calculation-steps">
                        <p>Determinan = (${formatNumberForDisplay(matrix[0][0])} &times; ${formatNumberForDisplay(matrix[1][1])}) - (${formatNumberForDisplay(matrix[0][1])} &times; ${formatNumberForDisplay(matrix[1][0])})</p>
                        <p> = ${ formatNumberForDisplay(matrix[0][0]*matrix[1][1])} - ${ formatNumberForDisplay(matrix[0][1]*matrix[1][0])}</p>
                        <p class="step-final-term-value">Determinan = ${formatNumberForDisplay(det)}</p>
                    </div>
                </div>
            `);
            return det;
        }

        let det = 0;
        addStep(`
            <div class="calculation-step">
                <div class="step-header">Ekspansi Minor-Kofaktor Sepanjang Baris Pertama (Ordo ${order}x${order})</div>
                <p class="explanation-text expansion-start">Mengembangkan determinan sepanjang baris pertama:</p>
                <p class="step-calculation-formula">det(A) = &Sigma; (-1)<sup>(i+j)</sup> &times; a<sub>ij</sub> &times; M<sub>ij</sub></p>
            </div>
        `);

        for (let j = 0; j < order; j++) {
            const sign = (j % 2 === 0) ? 1 : -1;
            const subMatrix = getSubMatrix(matrix, 0, j); 

            addStep(`
                <div class="calculation-step">
                    <div class="step-header">Langkah Kofaktor untuk Elemen ${formatNumberForDisplay(matrix[0][j])} (kolom ${j + 1})</div>
                    <p class="explanation-text">Ambil elemen <span class="step-element">${formatNumberForDisplay(matrix[0][j])}</span> di baris 1, kolom ${j + 1}.</p>
                    <p class="explanation-text">Cari minor matriksnya (M<sub>0${j + 1}</sub>) dengan menghapus baris 1 dan kolom ${j + 1}:</p>
                    ${createMatrixHTML(subMatrix, 'output')}
                    <p class="explanation-text">Hitung determinan dari minor ini:</p>
                </div>
            `);

            const minorDet = calculateDeterminantMinorCofactor(subMatrix, addStep); 

            const term = sign * matrix[0][j] * minorDet;
            det += term;

            addStep(`
                <div class="calculation-step">
                    <div class="step-header">Hasil Kofaktor C<sub>0${j + 1}</sub></div>
                    <p class="explanation-text">Kofaktor C<sub>0${j + 1}</sub> = ${sign > 0 ? '' : '-'} (${formatNumberForDisplay(Math.abs(matrix[0][j]))} &times; ${formatNumberForDisplay(minorDet)}) = <span class="step-final-term-value">${formatNumberForDisplay(term)}</span></p>
                    <p class="explanation-text">Tambahkan nilai ini ke total determinan.</p>
                </div>
                ${j < order -1 ? '<hr class="step-separator">' : ''}
            `);
        }

        addStep(`
            <div class="final-sum-explanation">
                <div class="step-header">Total Determinan Akhir</div>
                <p>Menjumlahkan semua kofaktor: <span class="step-final-term-value">${formatNumberForDisplay(det)}</span></p>
            </div>
        `);
        return det;
    }

    // Fungsi pembantu untuk minor kofaktor
    function getSubMatrix(matrix, excludeRow, excludeCol) {
        const subMatrix = [];
        for (let i = 0; i < matrix.length; i++) {
            if (i === excludeRow) continue;
            const row = [];
            for (let j = 0; j < matrix[i].length; j++) {
                if (j === excludeCol) continue;
                row.push(matrix[i][j]);
            }
            subMatrix.push(row);
        }
        return subMatrix;
    }


    // --- Fungsi untuk Penjumlahan Matriks ---
    function addMatrices(matrices, addStep) {
        if (matrices.length < 2) throw new Error("Penjumlahan memerlukan minimal dua matriks.");
        
        const rows = matrices[0].length;
        const cols = matrices[0][0].length;
        for(let k = 1; k < matrices.length; k++) {
            if (!matrices[k] || matrices[k].length !== rows || !matrices[k][0] || matrices[k][0].length !== cols) {
                throw new Error("Semua matriks harus memiliki ordo yang sama dan valid untuk penjumlahan.");
            }
        }

        let result = Array(rows).fill(0).map(() => Array(cols).fill(0));

        addStep(`
            <div class="calculation-step">
                <p class="explanation-text">Penjumlahan matriks dilakukan dengan menjumlahkan elemen-elemen pada posisi yang sama dari setiap matriks.</p>
        `);
        
        addStep(`
            <div class="minor-calculation-steps">
                <p>Matriks A:</p>${createMatrixHTML(matrices[0], 'output')}
                <p>Matriks B:</p>${createMatrixHTML(matrices[1], 'output')}
                ${matrices.length > 2 ? `<p>Matriks C:</p>${createMatrixHTML(matrices[2], 'output')}` : ''}
            </div>
        `);


        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let sum = 0;
                let sumExpression = '';
                matrices.forEach((matrix, index) => {
                    sum += matrix[i][j];
                    sumExpression += `${formatNumberForDisplay(matrix[i][j])}${index < matrices.length - 1 ? ' + ' : ''}`;
                });
                result[i][j] = sum;
                addStep(`
                    <div class="calculation-step">
                        <div class="step-header">Elemen Hasil Matriks Posisi [${i + 1},${j + 1}]</div>
                        <p class="explanation-text">Posisi [${i + 1},${j + 1}]: ${sumExpression} = <span class="step-final-term-value">${formatNumberForDisplay(sum)}</span></p>
                    </div>
                `);
            }
        }
        addStep(`</div>`); 
        return result;
    }

    // --- Fungsi untuk Pengurangan Matriks ---
    function subtractMatrices(matrices, addStep) {
        if (matrices.length < 2) throw new Error("Pengurangan memerlukan minimal dua matriks.");

        const rows = matrices[0].length;
        const cols = matrices[0][0].length;
        for(let k = 1; k < matrices.length; k++) {
            if (!matrices[k] || matrices[k].length !== rows || !matrices[k][0] || matrices[k][0].length !== cols) {
                throw new Error("Semua matriks harus memiliki ordo yang sama dan valid untuk pengurangan.");
            }
        }

        let result = Array(rows).fill(0).map(() => Array(cols).fill(0));

        addStep(`
            <div class="calculation-step">
                <p class="explanation-text">Pengurangan matriks dilakukan dengan mengurangkan elemen-elemen pada posisi yang sama dari matriks pertama dengan matriks berikutnya.</p>
        `);
        
        addStep(`
            <div class="minor-calculation-steps">
                <p>Matriks A:</p>${createMatrixHTML(matrices[0], 'output')}
                <p>Matriks B:</p>${createMatrixHTML(matrices[1], 'output')}
                ${matrices.length > 2 ? `<p>Matriks C:</p>${createMatrixHTML(matrices[2], 'output')}` : ''}
            </div>
        `);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let diff = matrices[0][i][j];
                let diffExpression = `${formatNumberForDisplay(matrices[0][i][j])}`;
                for (let k = 1; k < matrices.length; k++) {
                    diff -= matrices[k][i][j];
                    diffExpression += ` - ${formatNumberForDisplay(matrices[k][i][j])}`;
                }
                result[i][j] = diff;
                addStep(`
                    <div class="calculation-step">
                        <div class="step-header">Elemen Hasil Matriks Posisi [${i + 1},${j + 1}]</div>
                        <p class="explanation-text">Posisi [${i + 1},${j + 1}]: ${diffExpression} = <span class="step-final-term-value">${formatNumberForDisplay(diff)}</span></p>
                    </div>
                `);
            }
        }
        addStep(`</div>`); 
        return result;
    }

    // --- Fungsi untuk Perkalian Matriks ---
    function multiplyMatrices(matrices, addStep) {
        if (matrices.length < 2) throw new Error("Perkalian memerlukan minimal dua matriks.");

        let currentResult = matrices[0];

        addStep(`
            <div class="calculation-step">
                <p class="explanation-text">Perkalian elemen baris matriks pertama dengan kolom matriks kedua, lalu dijumlahkan. Proses ini diulang untuk setiap pasang matriks.</p>
        `);
        
        addStep(`
            <div class="minor-calculation-steps">
                <p>Matriks A:</p>${createMatrixHTML(matrices[0], 'output')}
                <p>Matriks B:</p>${createMatrixHTML(matrices[1], 'output')}
                ${matrices.length > 2 ? `<p>Matriks C:</p>${createMatrixHTML(matrices[2], 'output')}` : ''}
            </div>
        `);
        addStep(`</div>`); 

        for (let k = 1; k < matrices.length; k++) {
            const matrixA = currentResult;
            const matrixB = matrices[k];

            if (!matrixA || !Array.isArray(matrixA) || matrixA.length === 0 || !Array.isArray(matrixA[0]) ||
                !matrixB || !Array.isArray(matrixB) || matrixB.length === 0 || !Array.isArray(matrixB[0])) {
                throw new Error(`Matriks ${String.fromCharCode(64 + k)} atau ${String.fromCharCode(65 + k)} tidak valid untuk perkalian.`);
            }

            const rowsA = matrixA.length;
            const colsA = matrixA[0].length;
            const rowsB = matrixB.length;
            const colsB = matrixB[0].length; 

            if (colsA !== rowsB) {
                throw new Error(`Ukuran matriks tidak sesuai untuk perkalian. Kolom Matriks ${String.fromCharCode(64 + k)} (${colsA}) harus sama dengan Baris Matriks ${String.fromCharCode(65 + k)} (${rowsB}).`);
            }

            let newResult = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

            addStep(`
                <div class="calculation-step">
                    <div class="step-header">Perkalian Matriks ${String.fromCharCode(64 + k)} (${rowsA}x${colsA}) dengan Matriks ${String.fromCharCode(65 + k)} (${rowsB}x${colsB})</div>
                    <p class="explanation-text">Matriks ${String.fromCharCode(64 + k)}:</p>${createMatrixHTML(matrixA, 'output')}
                    <p class="explanation-text">Matriks ${String.fromCharCode(65 + k)}:</p>${createMatrixHTML(matrixB, 'output')}
            `);

            for (let i = 0; i < rowsA; i++) {
                for (let j = 0; j < colsB; j++) {
                    let sum = 0;
                    let sumExpression = '';
                    for (let l = 0; l < colsA; l++) { 
                        if (typeof matrixA[i][l] !== 'number' || typeof matrixB[l][j] !== 'number' || isNaN(matrixA[i][l]) || isNaN(matrixB[l][j])) {
                            throw new Error(`Elemen non-numerik ditemukan pada perkalian matriks di posisi A[${i}][${l}] atau B[${l}][${j}].`);
                        }
                        sum += matrixA[i][l] * matrixB[l][j];
                        sumExpression += `(${formatNumberForDisplay(matrixA[i][l])} * ${formatNumberForDisplay(matrixB[l][j])})` + (l < colsA - 1 ? ' + ' : '');
                    }
                    newResult[i][j] = sum;
                    addStep(`
                        <div class="minor-calculation-steps">
                            <div class="step-header">Elemen Hasil Matriks Posisi [${i + 1},${j + 1}]</div>
                            <p class="explanation-text">Baris ${i + 1} &times; Kolom ${j + 1}: ${sumExpression} = <span class="step-final-term-value">${formatNumberForDisplay(sum)}</span></p>
                        </div>
                    `);
                }
            }
            addStep(`</div>`); 
            currentResult = newResult;
            if (k < matrices.length -1 ) {
                addStep(`<hr class="step-separator">`); 
            }
        }
        return currentResult;
    }


    // --- Inisialisasi Tampilan Awal ---
    if (detMatrixOrderInput && opMatrixOrderInput && opMatrixCountSelect) {
        detMatrixOrderInput.addEventListener('change', () => createMatrixInputs('determinant'));
        opMatrixOrderInput.addEventListener('change', () => createMatrixInputs('operation'));
        opMatrixCountSelect.addEventListener('change', () => createMatrixInputs('operation'));
    } else {
        console.error("One or more key input elements (detMatrixOrderInput, opMatrixOrderInput, opMatrixCountSelect) are null on DOMContentLoaded.");
    }
    
    // Panggil switchMode setelah semua listener terpasang
    switchMode('determinant'); 

}); // End of DOMContentLoaded