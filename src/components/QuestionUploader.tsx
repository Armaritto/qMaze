import React from 'react';
import * as XLSX from 'xlsx';
import { Question } from '../types';

interface Props {
  onQuestionsParsed: (questions: Question[]) => void;
}

export default function QuestionUploader({ onQuestionsParsed }: Props) {
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

      const parsedQuestions: Question[] = (json as any[]).map((row, index) => ({
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

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Upload Questions Excel File</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>
    </div>
  );
}
