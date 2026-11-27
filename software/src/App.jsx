import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import ChatView from './components/ChatView';
import Composer from './components/Composer';
import Dashboard from './components/dashboard/Dashboard';
import SellerModal from './components/SellerModal';
import Toast from './components/Toast';
import { useAssistant } from './hooks/useAssistant';

export default function App() {
  const assistant = useAssistant();
  const { dashboardOpen, sellerOpen, closeDashboard, closeSeller } = assistant;
  const [toast, setToast] = useState(null);

  const showToast = (text) => setToast({ id: Date.now(), text });

  const handleReset = () => {
    assistant.reset();
    showToast('Nova conversa iniciada');
  };

  // Esc fecha o modal ou o painel.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (sellerOpen) closeSeller();
      else if (dashboardOpen) closeDashboard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sellerOpen, dashboardOpen, closeSeller, closeDashboard]);

  return (
    <div className="app">
      <TopBar inert={dashboardOpen} onSeller={() => assistant.requestSeller('top')} onReset={handleReset} />

      <ChatView messages={assistant.messages} onChip={assistant.selectChip} inert={dashboardOpen} />

      <Composer
        key={assistant.sessionKey}
        busy={assistant.busy}
        inert={dashboardOpen}
        onSubmit={assistant.submit}
        getVoiceSample={assistant.voiceSample}
        onToast={showToast}
      />

      <Dashboard
        key={assistant.recommendation?.id ?? 'empty'}
        rec={assistant.recommendation}
        open={dashboardOpen}
        onClose={closeDashboard}
        onReset={handleReset}
        onSeller={() => assistant.requestSeller('dash')}
      />

      <SellerModal open={sellerOpen} ticket={assistant.ticket} onClose={closeSeller} />
      <Toast toast={toast} />
    </div>
  );
}
