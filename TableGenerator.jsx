import React, { useState } from 'react';
import { Plus, Trash2, Download, Copy, FileText, Merge, X } from 'lucide-react';

export default function TableGenerator() {
  const [tableName, setTableName] = useState('Data Table');
  const [rowHeader, setRowHeader] = useState('#');
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(4);
  const [headers, setHeaders] = useState(['Column 1', 'Column 2', 'Column 3', 'Column 4']);
  const [data, setData] = useState(Array(5).fill(null).map(() => Array(4).fill('')));
  const [rowNumbers, setRowNumbers] = useState(Array(5).fill(null).map((_, i) => (i + 1).toString()));
  const [mergedCells, setMergedCells] = useState({});
  const [mergedRowCells, setMergedRowCells] = useState({});
  const [mergedHeaderCells, setMergedHeaderCells] = useState({});
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedRowCells, setSelectedRowCells] = useState([]);
  const [selectedHeaderCells, setSelectedHeaderCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tableNotes, setTableNotes] = useState('');
  const [tableCaption, setTableCaption] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const updateDimensions = (newRows, newCols) => {
    const currentRows = data.length;
    const currentCols = headers.length;

    let newData = [...data];
    let newHeaders = [...headers];
    let newRowNumbers = [...rowNumbers];

    if (newCols > currentCols) {
      newHeaders = [...headers, ...Array(newCols - currentCols).fill(null).map((_, i) => `Column ${currentCols + i + 1}`)];
      newData = newData.map(row => [...row, ...Array(newCols - currentCols).fill('')]);
    } else if (newCols < currentCols) {
      newHeaders = headers.slice(0, newCols);
      newData = newData.map(row => row.slice(0, newCols));
    }

    if (newRows > currentRows) {
      newData = [...newData, ...Array(newRows - currentRows).fill(null).map(() => Array(newCols).fill(''))];
      newRowNumbers = [...newRowNumbers, ...Array(newRows - currentRows).fill(null).map((_, i) => (currentRows + i + 1).toString())];
    } else if (newRows < currentRows) {
      newData = newData.slice(0, newRows);
      newRowNumbers = newRowNumbers.slice(0, newRows);
    }

    setHeaders(newHeaders);
    setData(newData);
    setRowNumbers(newRowNumbers);
  };

  const handleRowsChange = (e) => {
    const newRows = parseInt(e.target.value) || 1;
    setRows(newRows);
    updateDimensions(newRows, cols);
  };

  const handleColsChange = (e) => {
    const newCols = parseInt(e.target.value) || 1;
    setCols(newCols);
    updateDimensions(rows, newCols);
  };

  const handleHeaderChange = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleRowNumberChange = (index, value) => {
    const newRowNumbers = [...rowNumbers];
    newRowNumbers[index] = value;
    setRowNumbers(newRowNumbers);
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const addRow = () => {
    setRows(rows + 1);
    setData([...data, Array(cols).fill('')]);
    setRowNumbers([...rowNumbers, (rows + 1).toString()]);
  };

  const deleteRow = (index) => {
    if (rows > 1) {
      setRows(rows - 1);
      setData(data.filter((_, i) => i !== index));
      setRowNumbers(rowNumbers.filter((_, i) => i !== index));
    }
  };

  const addColumn = () => {
    setCols(cols + 1);
    setHeaders([...headers, `Column ${cols + 1}`]);
    setData(data.map(row => [...row, '']));
  };

  const deleteColumn = (index) => {
    if (cols > 1) {
      setCols(cols - 1);
      setHeaders(headers.filter((_, i) => i !== index));
      setData(data.map(row => row.filter((_, i) => i !== index)));
    }
  };

  const clearTable = () => {
    setData(Array(rows).fill(null).map(() => Array(cols).fill('')));
    setRowNumbers(Array(rows).fill(null).map((_, i) => (i + 1).toString()));
    setMergedCells({});
    setMergedRowCells({});
    setMergedHeaderCells({});
    setSelectedCells([]);
    setSelectedRowCells([]);
    setSelectedHeaderCells([]);
    setIsSelecting(false);
  };

  const handleDoubleClick = (rowIndex, colIndex, isRowColumn = false, isHeaderColumn = false) => {
    if (!isSelecting) return;
    
    if (!isDragging) {
      setIsDragging(true);
      setDragStart({ row: rowIndex, col: colIndex, isRowColumn, isHeaderColumn });
      if (isHeaderColumn) {
        setSelectedHeaderCells([{ col: colIndex, key: `header-${colIndex}` }]);
      } else if (isRowColumn) {
        setSelectedRowCells([{ row: rowIndex, key: `row-${rowIndex}` }]);
      } else {
        setSelectedCells([{ row: rowIndex, col: colIndex, key: `${rowIndex}-${colIndex}` }]);
      }
    } else {
      setIsDragging(false);
    }
  };

  const handleMouseEnter = (rowIndex, colIndex, isRowColumn = false, isHeaderColumn = false) => {
    if (!isSelecting || !isDragging || !dragStart) return;

    if (isHeaderColumn) {
      const minCol = Math.min(dragStart.col, colIndex);
      const maxCol = Math.max(dragStart.col, colIndex);
      
      const selected = [];
      for (let c = minCol; c <= maxCol; c++) {
        selected.push({ col: c, key: `header-${c}` });
      }
      setSelectedHeaderCells(selected);
      return;
    }

    if (isRowColumn) {
      const minRow = Math.min(dragStart.row, rowIndex);
      const maxRow = Math.max(dragStart.row, rowIndex);
      
      const selected = [];
      for (let r = minRow; r <= maxRow; r++) {
        selected.push({ row: r, key: `row-${r}` });
      }
      setSelectedRowCells(selected);
      
      if (!dragStart.isRowColumn) {
        const minCol = dragStart.col;
        const maxCol = dragStart.col;
        const dataSelected = [];
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            dataSelected.push({ row: r, col: c, key: `${r}-${c}` });
          }
        }
        setSelectedCells(dataSelected);
      }
    } else {
      const minRow = Math.min(dragStart.row, rowIndex);
      const maxRow = Math.max(dragStart.row, rowIndex);
      const minCol = dragStart.isRowColumn ? 0 : Math.min(dragStart.col, colIndex);
      const maxCol = Math.max(dragStart.col || 0, colIndex);

      const selected = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          selected.push({ row: r, col: c, key: `${r}-${c}` });
        }
      }
      setSelectedCells(selected);
      
      if (dragStart.isRowColumn) {
        const rowSelected = [];
        for (let r = minRow; r <= maxRow; r++) {
          rowSelected.push({ row: r, key: `row-${r}` });
        }
        setSelectedRowCells(rowSelected);
      }
    }
  };

  const startSelection = () => {
    setIsSelecting(true);
    setSelectedCells([]);
    setSelectedRowCells([]);
    setSelectedHeaderCells([]);
    setIsDragging(false);
    setDragStart(null);
  };

  const cancelSelection = () => {
    setIsSelecting(false);
    setSelectedCells([]);
    setSelectedRowCells([]);
    setSelectedHeaderCells([]);
    setIsDragging(false);
    setDragStart(null);
  };

  const mergeCells = () => {
    const hasRowCells = selectedRowCells.length > 0;
    const hasDataCells = selectedCells.length > 0;
    const hasHeaderCells = selectedHeaderCells.length > 0;

    if (hasHeaderCells && selectedHeaderCells.length >= 2) {
      const cols = selectedHeaderCells.map(c => c.col);
      const minCol = Math.min(...cols);
      const maxCol = Math.max(...cols);

      const key = `header-${minCol}`;
      const newMerged = { ...mergedHeaderCells };
      newMerged[key] = {
        colspan: maxCol - minCol + 1
      };

      setMergedHeaderCells(newMerged);
      setSelectedHeaderCells([]);
      setIsSelecting(false);
      setIsDragging(false);
      setDragStart(null);
    } else if (hasRowCells && hasDataCells) {
      const rows = selectedRowCells.map(c => c.row);
      const cols = selectedCells.map(c => c.col);
      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);
      const minCol = Math.min(...cols);
      const maxCol = Math.max(...cols);

      const key = `${minRow}-row-data`;
      const newMerged = { ...mergedCells };
      newMerged[key] = {
        colspan: maxCol + 2,
        rowspan: maxRow - minRow + 1,
        startsFromRow: true,
        minRow: minRow,
        maxCol: maxCol
      };

      setMergedCells(newMerged);
      setMergedRowCells({});
      setSelectedCells([]);
      setSelectedRowCells([]);
      setIsSelecting(false);
      setIsDragging(false);
      setDragStart(null);
    } else if (hasRowCells && selectedRowCells.length >= 2) {
      const rows = selectedRowCells.map(c => c.row);
      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);

      const key = `row-${minRow}`;
      const newMerged = { ...mergedRowCells };
      newMerged[key] = {
        rowspan: maxRow - minRow + 1
      };

      setMergedRowCells(newMerged);
      setSelectedRowCells([]);
      setIsSelecting(false);
      setIsDragging(false);
      setDragStart(null);
    } else if (hasDataCells && selectedCells.length >= 2) {
      const rows = selectedCells.map(c => c.row);
      const cols = selectedCells.map(c => c.col);
      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);
      const minCol = Math.min(...cols);
      const maxCol = Math.max(...cols);

      const key = `${minRow}-${minCol}`;
      const newMerged = { ...mergedCells };
      newMerged[key] = {
        colspan: maxCol - minCol + 1,
        rowspan: maxRow - minRow + 1
      };

      setMergedCells(newMerged);
      setSelectedCells([]);
      setIsSelecting(false);
      setIsDragging(false);
      setDragStart(null);
    } else {
      alert('Please select at least 2 cells to merge');
    }
  };

  const unmergeCell = (rowIndex, colIndex, isRowColumn = false, isHeaderColumn = false) => {
    if (isHeaderColumn) {
      const key = `header-${colIndex}`;
      const newMerged = { ...mergedHeaderCells };
      delete newMerged[key];
      setMergedHeaderCells(newMerged);
    } else if (isRowColumn) {
      const key = `row-${rowIndex}`;
      const newMerged = { ...mergedRowCells };
      delete newMerged[key];
      setMergedRowCells(newMerged);
    } else {
      const key = `${rowIndex}-${colIndex}`;
      const newMerged = { ...mergedCells };
      delete newMerged[key];
      setMergedCells(newMerged);
    }
  };

  const isCellHidden = (row, col) => {
    for (const [key, merge] of Object.entries(mergedCells)) {
      if (merge.startsFromRow) {
        const minRow = merge.minRow;
        const maxRow = minRow + merge.rowspan - 1;
        const maxCol = merge.maxCol;
        
        if (row >= minRow && row <= maxRow && col >= 0 && col <= maxCol) {
          return key !== `${row}-row-data`;
        }
      }
    }
    
    for (let r = 0; r <= row; r++) {
      for (let c = 0; c <= col; c++) {
        const key = `${r}-${c}`;
        const merge = mergedCells[key];
        if (merge && !merge.startsFromRow) {
          if (r + merge.rowspan > row && c + merge.colspan > col && !(r === row && c === col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isCellSelected = (rowIndex, colIndex, isRowColumn = false, isHeaderColumn = false) => {
    if (isHeaderColumn) {
      return selectedHeaderCells.some(cell => cell.col === colIndex);
    }
    if (isRowColumn) {
      return selectedRowCells.some(cell => cell.row === rowIndex);
    }
    return selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
  };

  const isCellMerged = (rowIndex, colIndex, isRowColumn = false, isHeaderColumn = false) => {
    if (isHeaderColumn) {
      const key = `header-${colIndex}`;
      return mergedHeaderCells[key] !== undefined;
    }
    if (isRowColumn) {
      const key = `row-${rowIndex}`;
      return mergedRowCells[key] !== undefined;
    }
    const key = `${rowIndex}-${colIndex}`;
    return mergedCells[key] !== undefined;
  };

  const isHeaderCellHidden = (colIndex) => {
    for (let c = 0; c <= colIndex; c++) {
      const key = `header-${c}`;
      const merge = mergedHeaderCells[key];
      if (merge && c + merge.colspan > colIndex && c !== colIndex) {
        return true;
      }
    }
    return false;
  };

  const isRowCellHidden = (rowIndex) => {
    for (const [key, merge] of Object.entries(mergedCells)) {
      if (merge.startsFromRow) {
        const minRow = merge.minRow;
        const maxRow = minRow + merge.rowspan - 1;
        if (rowIndex >= minRow && rowIndex <= maxRow && rowIndex !== minRow) {
          return true;
        }
      }
    }
    
    for (let r = 0; r <= rowIndex; r++) {
      const key = `row-${r}`;
      const merge = mergedRowCells[key];
      if (merge && r + merge.rowspan > rowIndex && r !== rowIndex) {
        return true;
      }
    }
    return false;
  };

  const exportToCSV = () => {
    const rows = [headers.join(',')];
    data.forEach(row => {
      rows.push(row.join(','));
    });
    const csv = rows.join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = tableName.replace(/\s+/g, '_') + '.csv';
    a.download = filename;
    a.click();
  };

  const copyToClipboard = () => {
    const text = [
      headers.join('\t'),
      ...data.map(row => row.join('\t'))
    ].join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Table copied to clipboard!');
    });
  };

  const generateLatex = () => {
    const backslash = '\\';
    let latex = backslash + 'begin{table}[h]\n' + backslash + 'centering\n';
    if (tableCaption) {
      latex += backslash + 'caption{' + tableCaption + '}\n';
    }
    const colFormat = 'c|'.repeat(cols + 1);
    latex += backslash + 'begin{tabular}{|' + colFormat + '}\n' + backslash + 'hline\n';
    
    latex += backslash + 'textbf{' + rowHeader + '}';
    
    let headerSkipCount = 0;
    headers.forEach((h, index) => {
      if (headerSkipCount > 0) {
        headerSkipCount = headerSkipCount - 1;
        return;
      }
      
      if (isHeaderCellHidden(index)) {
        return;
      }
      
      const headerKey = 'header-' + index;
      const headerMerge = mergedHeaderCells[headerKey];
      
      if (headerMerge && headerMerge.colspan > 1) {
        latex += ' & ' + backslash + 'multicolumn{' + headerMerge.colspan + '}{|c|}{' + backslash + 'textbf{' + h + '}}';
        headerSkipCount = headerMerge.colspan - 1;
      } else {
        latex += ' & ' + backslash + 'textbf{' + h + '}';
      }
    });
    latex += ' ' + backslash + backslash + '\n' + backslash + 'hline\n';
    
    data.forEach((row, rowIndex) => {
      const cells = [];
      let skipCount = 0;
      
      if (!isRowCellHidden(rowIndex)) {
        const rowKey = 'row-' + rowIndex;
        const rowMerge = mergedRowCells[rowKey];
        if (rowMerge) {
          cells.push(backslash + 'multirow{' + rowMerge.rowspan + '}{*}{' + rowNumbers[rowIndex] + '}');
        } else {
          cells.push(rowNumbers[rowIndex]);
        }
      }
      
      row.forEach((cell, colIndex) => {
        if (skipCount > 0) {
          skipCount = skipCount - 1;
          return;
        }
        
        if (isCellHidden(rowIndex, colIndex)) {
          return;
        }
        
        const key = rowIndex + '-' + colIndex;
        const merge = mergedCells[key];
        
        if (merge) {
          if (merge.colspan > 1 && merge.rowspan > 1) {
            cells.push(backslash + 'multicolumn{' + merge.colspan + '}{|c|}{' + backslash + 'multirow{' + merge.rowspan + '}{*}{' + cell + '}}');
            skipCount = merge.colspan - 1;
          } else if (merge.colspan > 1) {
            cells.push(backslash + 'multicolumn{' + merge.colspan + '}{|c|}{' + cell + '}');
            skipCount = merge.colspan - 1;
          } else if (merge.rowspan > 1) {
            cells.push(backslash + 'multirow{' + merge.rowspan + '}{*}{' + cell + '}');
          }
        } else {
          cells.push(cell);
        }
      });
      
      latex += cells.join(' & ') + ' ' + backslash + backslash + '\n' + backslash + 'hline\n';
    });
    
    latex += backslash + 'end{tabular}\n';
    if (tableNotes) {
      latex += backslash + backslash + '[0.5em]\n' + backslash + 'small{' + tableNotes + '}\n';
    }
    latex += backslash + 'end{table}\n';
    
    if (additionalInfo) {
      const lines = additionalInfo.split('\n');
      latex += '\n% Additional Information:\n';
      lines.forEach(line => {
        latex += '% ' + line + '\n';
      });
    }
    
    return latex;
  };

  const downloadLatex = () => {
    const latex = generateLatex();
    const blob = new Blob([latex], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = tableName.replace(/\s+/g, '_') + '.tex';
    a.download = filename;
    a.click();
  };

  const downloadPDF = () => {
    const latex = generateLatex();
    const backslash = '\\';
    
    let fullLatex = backslash + 'documentclass{article}\n';
    fullLatex += backslash + 'usepackage{multirow}\n';
    fullLatex += backslash + 'usepackage{array}\n';
    fullLatex += backslash + 'usepackage[margin=1in]{geometry}\n\n';
    fullLatex += backslash + 'begin{document}\n\n';
    fullLatex += backslash + 'title{' + tableName + '}\n';
    fullLatex += backslash + 'date{' + backslash + 'today}\n';
    fullLatex += backslash + 'maketitle\n\n';
    
    if (additionalInfo) {
      fullLatex += backslash + 'section*{Additional Information}\n' + additionalInfo + '\n\n';
    }
    
    fullLatex += latex;
    fullLatex += '\n' + backslash + 'end{document}';
    
    const blob = new Blob([fullLatex], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tableName.replace(/\s+/g, '_') + '_full.tex';
    a.click();
    
    alert('Full LaTeX document downloaded. Compile with pdflatex to generate PDF.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Advanced Table Generator</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Name</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rows</label>
              <input
                type="number"
                min="1"
                value={rows}
                onChange={handleRowsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
              <input
                type="number"
                min="1"
                value={cols}
                onChange={handleColsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Caption (for LaTeX)</label>
              <input
                type="text"
                value={tableCaption}
                onChange={(e) => setTableCaption(e.target.value)}
                placeholder="Enter table caption..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Row Header Label</label>
              <input
                type="text"
                value={rowHeader}
                onChange={(e) => setRowHeader(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Table Notes</label>
            <textarea
              value={tableNotes}
              onChange={(e) => setTableNotes(e.target.value)}
              placeholder="Notes to appear below the table..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional information about the experiment, methodology, etc..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              <Plus size={16} /> Add Row
            </button>
            <button
              onClick={addColumn}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              <Plus size={16} /> Add Column
            </button>
            {!isSelecting ? (
              <button
                onClick={startSelection}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
              >
                <Merge size={16} /> Select to Merge
              </button>
            ) : (
              <>
                <button
                  onClick={mergeCells}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                >
                  <Merge size={16} /> Merge ({selectedCells.length + selectedRowCells.length + selectedHeaderCells.length} cells)
                </button>
                <button
                  onClick={cancelSelection}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                >
                  <X size={16} /> Cancel
                </button>
              </>
            )}
            <button
              onClick={clearTable}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
            >
              <Copy size={16} /> Copy
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition"
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={downloadLatex}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              <FileText size={16} /> LaTeX Table
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
            >
              <FileText size={16} /> Full LaTeX Doc
            </button>
          </div>

          {isSelecting && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Selection Mode Active - Double-Click to Select</strong>
                <br />
                1. <strong>Double-click</strong> on any cell (including # column or header columns) to start selection
                <br />
                2. <strong>Move your pointer</strong> over cells to extend selection
                <br />
                3. <strong>Double-click again</strong> on any cell to finish selection
                <br />
                Currently selected: {selectedCells.length + selectedRowCells.length + selectedHeaderCells.length} cell(s) | Status: {isDragging ? '✓ Selecting...' : 'Ready - Double-click to start'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Table Preview</h2>
          <table className="w-full border-collapse" style={{ userSelect: 'none' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-sm font-semibold">
                  <input
                    type="text"
                    value={rowHeader}
                    onChange={(e) => setRowHeader(e.target.value)}
                    className="w-full px-2 py-1 text-sm font-semibold text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded"
                  />
                </th>
                {headers.map((header, index) => {
                  if (isHeaderCellHidden(index)) {
                    return null;
                  }
                  
                  const headerKey = `header-${index}`;
                  const headerMerge = mergedHeaderCells[headerKey];
                  const isSelected = isCellSelected(0, index, false, true);
                  const isMerged = isCellMerged(0, index, false, true);
                  
                  return (
                    <th 
                      key={index} 
                      className={`border border-gray-300 px-2 py-2 relative ${
                        isSelected ? 'bg-blue-200' : ''
                      } ${isSelecting ? 'cursor-crosshair' : ''}`}
                      colSpan={headerMerge?.colspan || 1}
                      onDoubleClick={() => handleDoubleClick(0, index, false, true)}
                      onMouseEnter={() => handleMouseEnter(0, index, false, true)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(index, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm font-semibold bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded"
                          disabled={isSelecting}
                        />
                        <button
                          onClick={() => deleteColumn(index)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete column"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {isMerged && !isSelecting && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unmergeCell(0, index, false, true);
                          }}
                          className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                          title="Unmerge cell"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => {
                const crossMergeKey = `${rowIndex}-row-data`;
                const crossMerge = mergedCells[crossMergeKey];
                
                return (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {crossMerge ? (
                      <td
                        className={`border border-gray-300 px-2 py-2 relative ${
                          isCellSelected(rowIndex, 0, true) || isCellSelected(rowIndex, 0, false) ? 'bg-blue-200' : 'bg-gray-50'
                        } ${isSelecting ? 'cursor-crosshair' : ''}`}
                        colSpan={crossMerge.maxCol + 2}
                        rowSpan={crossMerge.rowspan}
                        onDoubleClick={() => handleDoubleClick(rowIndex, 0, true)}
                        onMouseEnter={() => handleMouseEnter(rowIndex, 0, true)}
                      >
                        <input
                          type="text"
                          value={row[0] || rowNumbers[rowIndex]}
                          onChange={(e) => {
                            if (crossMerge.maxCol >= 0) {
                              handleCellChange(rowIndex, 0, e.target.value);
                            } else {
                              handleRowNumberChange(rowIndex, e.target.value);
                            }
                          }}
                          className="w-full px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 rounded bg-transparent"
                          disabled={isSelecting}
                        />
                        {!isSelecting && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newMerged = { ...mergedCells };
                              delete newMerged[crossMergeKey];
                              setMergedCells(newMerged);
                            }}
                            className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                            title="Unmerge cell"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </td>
                    ) : (
                      <>
                        {!isRowCellHidden(rowIndex) && (
                          <td 
                            className={`border border-gray-300 px-2 py-2 text-center bg-gray-50 relative ${
                              isCellSelected(rowIndex, 0, true) ? 'bg-blue-200' : ''
                            } ${isSelecting ? 'cursor-crosshair' : ''}`}
                            rowSpan={mergedRowCells[`row-${rowIndex}`]?.rowspan || 1}
                            onDoubleClick={() => handleDoubleClick(rowIndex, 0, true)}
                            onMouseEnter={() => handleMouseEnter(rowIndex, 0, true)}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="text"
                                value={rowNumbers[rowIndex]}
                                onChange={(e) => handleRowNumberChange(rowIndex, e.target.value)}
                                className="w-16 px-2 py-1 text-sm font-medium text-center bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded"
                                disabled={isSelecting}
                              />
                              <button
                                onClick={() => deleteRow(rowIndex)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete row"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            {isCellMerged(rowIndex, 0, true) && !isSelecting && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  unmergeCell(rowIndex, 0, true);
                                }}
                                className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                                title="Unmerge cell"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </td>
                        )}
                        {row.map((cell, colIndex) => {
                          if (isCellHidden(rowIndex, colIndex)) {
                            return null;
                          }
                          
                          const key = `${rowIndex}-${colIndex}`;
                          const merge = mergedCells[key];
                          const isSelected = isCellSelected(rowIndex, colIndex, false);
                          const isMerged = isCellMerged(rowIndex, colIndex, false);
                          
                          return (
                            <td
                              key={colIndex}
                              colSpan={merge?.colspan || 1}
                              rowSpan={merge?.rowspan || 1}
                              className={`border border-gray-300 px-2 py-2 relative transition-colors ${
                                isSelected ? 'bg-blue-200' : ''
                              } ${isSelecting ? 'cursor-crosshair' : ''}`}
                              onDoubleClick={() => handleDoubleClick(rowIndex, colIndex, false)}
                              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex, false)}
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="w-full px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 rounded bg-transparent"
                                disabled={isSelecting}
                              />
                              {isMerged && !isSelecting && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unmergeCell(rowIndex, colIndex, false);
                                  }}
                                  className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                                  title="Unmerge cell"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {tableNotes && (
            <div className="mt-4 text-sm text-gray-600 italic">
              {tableNotes}
            </div>
          )}
        </div>

        {additionalInfo && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
}