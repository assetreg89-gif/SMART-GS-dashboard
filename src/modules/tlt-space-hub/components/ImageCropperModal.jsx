import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, Crop } from 'lucide-react';

export default function ImageCropperModal({ isOpen, onClose, imageSrc, onCropComplete }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const targetWidth = 800;
    const targetHeight = 450;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const container = containerRef.current;
    const containerWidth = container ? container.clientWidth : 460;
    const containerHeight = container ? container.clientHeight : 260;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scaleFactor = targetWidth / containerWidth;
    const drawX = offset.x * scaleFactor;
    const drawY = offset.y * scaleFactor;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW = targetWidth;
    let drawH = targetWidth / imgAspect;

    if (drawH < targetHeight) {
      drawH = targetHeight;
      drawW = targetHeight * imgAspect;
    }

    ctx.drawImage(img, -drawW / 2 + drawX, -drawH / 2 + drawY, drawW, drawH);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-container glass-card" style={{ maxWidth: '520px', padding: '1.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crop size={20} color="var(--primary-red)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-title)' }}>
              Sesuaikan & Potong Foto Ruangan
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
          Geser foto untuk menyesuaikan area tampilan, atau gunakan slider zoom dan tombol rotasi.
        </p>

        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            width: '100%', 
            height: '260px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            position: 'relative', 
            background: '#0f172a',
            cursor: isDragging ? 'grabbing' : 'grab',
            border: '2px solid var(--primary-red)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            userSelect: 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            border: '2px dashed rgba(255, 255, 255, 0.6)',
            borderRadius: '10px',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: 'inset 0 0 0 1000px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ position: 'absolute', top: '33.3%', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', top: '66.6%', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.3)' }} />
          </div>

          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              ref={imageRef}
              src={imageSrc} 
              alt="Crop Target" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease',
                pointerEvents: 'none'
              }} 
            />
          </div>

          <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', pointerEvents: 'none' }}>
            <Move size={12} /> Drag untuk Geser
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ZoomOut size={16} color="var(--text-muted)" />
            <input 
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary-red)', cursor: 'pointer' }}
            />
            <ZoomIn size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '40px' }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
            <button 
              type="button" 
              onClick={handleRotate} 
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem', gap: '0.375rem' }}
            >
              <RotateCw size={15} /> Putar 90°
            </button>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem' }}>
                Batal
              </button>
              <button type="button" onClick={handleApplyCrop} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem', gap: '0.375rem' }}>
                <Check size={15} /> Terapkan & Potong Foto
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
