import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Wifi, ShieldCheck, Battery } from 'lucide-react';

export default function WhatsappSetup() {
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, type: 'info', text: 'Servicio iniciado. Esperando vinculación...', time: '15:10' }
  ]);

  const handleConnect = () => {
    setIsScanning(true);
    addLog('info', 'Generando código QR dinámico...');
    
    setTimeout(() => {
      addLog('info', 'QR escaneado. Autenticando sesión con WhatsApp Web...');
      
      setTimeout(() => {
        setIsConnected(true);
        setIsScanning(false);
        addLog('success', 'Sesión iniciada con éxito en iPhone 14 Pro.');
        addLog('success', 'Sincronización de chats completada (124 chats activos).');
      }, 1500);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    addLog('warning', 'Sesión cerrada por el usuario. WhatsApp desconectado.');
  };

  const addLog = (type, text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      { id: Date.now(), type, text, time },
      ...prev
    ]);
  };

  return (
    <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden select-none p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Canal WhatsApp</h1>
        <p className="text-sm text-slate-400 font-semibold mt-0.5">Conecta tu número telefónico para enviar y recibir mensajes automáticamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Left Card: Connection Interface */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm">
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            Estado de la conexión
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {!isConnected ? (
              <div className="flex flex-col items-center text-center max-w-sm">
                {/* Simulated QR Box */}
                <div className="relative p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm mb-6">
                  {/* Scanner overlay effect */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-emerald-500 rounded animate-bounce top-4 bottom-4" style={{ animationDuration: '2s' }} />
                  )}
                  
                  {/* Simple Simulated QR Code */}
                  <div className={`h-48 w-48 rounded-xl bg-slate-900 flex items-center justify-center ${isScanning ? 'opacity-80' : ''} transition-opacity`}>
                    <div className="grid grid-cols-5 gap-1.5 p-4 w-full h-full">
                      {[...Array(25)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-sm ${(i * 3 + i % 2) % 3 === 0 || i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-white' : 'bg-transparent'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-1">Escanea el código QR</h3>
                <p className="text-xs text-slate-400 font-semibold mb-6">
                  Abre WhatsApp en tu teléfono, ve a Dispositivos Vinculados y presiona "Vincular un dispositivo".
                </p>

                <button
                  onClick={handleConnect}
                  disabled={isScanning}
                  className={`w-full py-3 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 text-white shadow-md transition-all ${
                    isScanning 
                      ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 active:scale-95'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      <span>Vinculando dispositivo...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4.5 w-4.5" />
                      <span>Simular Escaneo QR</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Connected State
              <div className="flex flex-col items-center text-center max-w-sm animate-scale-up">
                <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100/50 mb-6">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-1">¡WhatsApp Vinculado con éxito!</h3>
                <p className="text-xs text-slate-400 font-semibold mb-6">
                  Tu sistema está en línea y gestionando chats en tiempo real.
                </p>

                {/* Device Info */}
                <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3.5 mb-8 text-left">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Smartphone className="h-4 w-4" />
                      Dispositivo
                    </span>
                    <span>iPhone 14 Pro Max</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Wifi className="h-4 w-4" />
                      Señal de Red
                    </span>
                    <span className="text-emerald-600">Excelente (LTE)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Battery className="h-4 w-4" />
                      Batería
                    </span>
                    <span>89%</span>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  Desconectar Cuenta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Activity Logs */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm h-full overflow-hidden">
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2 shrink-0">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Consola del Servidor
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-mono text-[11px]">
            {logs.map(log => (
              <div 
                key={log.id} 
                className={`p-2.5 rounded-xl border ${
                  log.type === 'success' 
                    ? 'bg-emerald-50/50 border-emerald-100/30 text-emerald-800' 
                    : log.type === 'warning' 
                      ? 'bg-amber-50/50 border-amber-100/30 text-amber-800' 
                      : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1 opacity-70">
                  <span>[{log.type.toUpperCase()}]</span>
                  <span>{log.time}</span>
                </div>
                <p className="leading-relaxed font-semibold">{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
