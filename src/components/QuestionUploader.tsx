import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Question } from '../types';
import { FaUpload as Upload } from 'react-icons/fa';

interface Props {
  onQuestionsParsed: (questions: Question[]) => void;
}

export default function QuestionUploader({ onQuestionsParsed }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const parsedQuestions: Question[] = (json as Array<any>).map((row, index) => ({
        id: index + 1,
        text: row.question,
        options: [row.A, row.B, row.C],
        correctAnswer: ['A', 'B', 'C'].indexOf(row.correctAnswer),
        grade: row.grade || 'Junior 4', // fallback if grade not specified
      }));

      onQuestionsParsed(parsedQuestions);
    };

    reader.readAsBinaryString(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fileEvent);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Upload Questions</h2>
        
        <div
          className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors duration-200 ${
            isDragging ? 'border-[#b6773c] bg-[#fee29520]' : 'border-gray-300 hover:border-[#b6773c]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-[#b6773c]" />
          <p className="text-gray-600 mb-2">Drag and drop your Excel file here</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          
          <label className="relative inline-block">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="px-6 py-2.5 rounded-lg text-white font-medium cursor-pointer inline-block bg-gradient-to-r from-[#b6773c] to-[#fee295] hover:opacity-90 transition-opacity">
              Browse Files
            </span>
          </label>
          
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: .xlsx, .xls
          </p>
        </div>
      </div>
    </div>
  );
}
