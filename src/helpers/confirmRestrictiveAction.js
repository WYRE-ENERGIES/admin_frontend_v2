import { Modal } from 'antd';

const pastTense = (action) => {
  const word = String(action || '').trim().toLowerCase();
  if (!word) return 'updated';
  if (word.endsWith('e')) return `${word}d`;
  return `${word}ed`;
};

export const confirmRestrictiveAction = ({ action, name, onOk }) => {
  const verb = String(action || '').trim();
  const target = name || 'this record';

  Modal.confirm({
    title: `${verb} ${target}?`,
    content: `${target} will be ${pastTense(verb)}.`,
    okText: verb,
    okButtonProps: { danger: true },
    cancelText: 'Cancel',
    onOk,
  });
};
