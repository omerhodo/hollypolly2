'use client';

import type { Option, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface OptionListProps {
  options: Option[];
  users: User[];
  currentUser: User | null;
  roomTitle?: string;
  onAddOption: (text: string) => void;
  onDeleteOption: (optionId: string) => void;
  onSelectWinner: () => void;
  onSelectLoser: () => void;
  onUpdateTitle: (title: string) => void;
  onCreateRandomTeams: (teamCount: number) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
  options,
  users,
  currentUser,
  roomTitle,
  onAddOption,
  onDeleteOption,
  onSelectWinner,
  onSelectLoser,
  onUpdateTitle,
  onCreateRandomTeams,
}) => {
  const t = useTranslations('options');
  const tRoom = useTranslations('room');
  const [newOption, setNewOption] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(roomTitle || '');
  const [teamCount, setTeamCount] = useState(2);

  const isAdmin = currentUser?.is_admin || false;

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOption.trim() && isAdmin) {
      onAddOption(newOption.trim());
      setNewOption('');
    }
  };

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      onUpdateTitle(titleValue.trim());
    }
    setEditingTitle(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Room Title */}
      <div className="mb-6">
        {editingTitle && isAdmin ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={tRoom('drawName')}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setEditingTitle(false);
              }}
            />
            <button
              onClick={handleSaveTitle}
              className="px-3 py-2 bg-primary-500 text-white rounded-lg"
            >
              ✓
            </button>
            <button
              onClick={() => setEditingTitle(false)}
              className="px-3 py-2 bg-gray-300 rounded-lg"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {roomTitle || tRoom('drawName')}
            </h1>
            {isAdmin && (
              <button
                onClick={() => {
                  setTitleValue(roomTitle || '');
                  setEditingTitle(true);
                }}
                className="text-sm text-primary-600 hover:underline"
              >
                ✏️
              </button>
            )}
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">{t('title')}</h2>

      {/* Add Option Form */}
      <form onSubmit={handleAddOption} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder={t('addPlaceholder')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={!isAdmin}
          />
          <button
            type="submit"
            disabled={!isAdmin || !newOption.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('add')}
          </button>
        </div>
        {!isAdmin && (
          <p className="text-xs text-gray-500 mt-2">{t('isNotAdmin')}</p>
        )}
      </form>

      {/* Options List */}
      <div className="space-y-2 mb-6">
        <AnimatePresence>
          {options.length === 0 ? (
            <p className="text-gray-400 text-center py-4">{t('noOptions')}</p>
          ) : (
            options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="flex-1">{option.text}</span>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteOption(option.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Minimum Options Warning */}
      {isAdmin && options.length < 2 && (
        <p className="text-xs text-gray-500 text-center mb-6">{t('needOptions')}</p>
      )}

      {/* Action Buttons */}
      {isAdmin && (
        <div className="mt-12">
          <div className="flex flex-col md:flex-row gap-6">
            <button
              onClick={onSelectWinner}
              disabled={options.length < 2}
              className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {tRoom('selectWinner')}
            </button>
            <button
              onClick={onSelectLoser}
              disabled={options.length < 2}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {tRoom('selectLoser')}
            </button>
          </div>

          {/* Random Teams Button */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onCreateRandomTeams(teamCount)}
                disabled={options.length < 2}
                className="flex-1 bg-cyan-500 text-white py-3 rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {t('createRandomTeams')}
              </button>

              {/* Team Count Counter */}
              <div className="flex items-center gap-2 bg-white border-2 border-cyan-500 rounded-lg px-3 py-2">
                <button
                  onClick={() => setTeamCount(Math.max(2, teamCount - 1))}
                  disabled={teamCount <= 2}
                  className="w-8 h-8 flex items-center justify-center bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-semibold text-gray-700">
                  {teamCount}
                </span>
                <button
                  onClick={() => setTeamCount(Math.min(options.length, teamCount + 1))}
                  disabled={teamCount >= options.length}
                  className="w-8 h-8 flex items-center justify-center bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">{t('teamCount')}: {teamCount}</p>
          </div>
        </div>
      )}
    </div>
  );
};
