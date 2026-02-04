import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import api from '@/api/axiosConfig';

const PurchaseButton = ({ listingId, price, disabled, sellerId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useModal();

  const isOwnTicket = user && sellerId && user.id === sellerId;

  const handlePurchase = async () => {

    if (!user) {
      openModal('login');
      return;
    }

    if (isPurchasing || loading) {
      return;
    }

    try {
      setIsPurchasing(true);
      setLoading(true);
      setError(null);

      const response = await api.post(`/tickets/${listingId}/buy`);

      navigate('/profile', {
        state: {
          message: 'Билет успешно приобретён!',
          tab: 'upcoming-purchases',
          refreshPurchases: true
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Не удалось купить билет';
      setError(msg);
      setIsPurchasing(false);
    } finally {
      console.log('🏁 Покупка завершена, сбрасываем loading');
      setLoading(false);
    }
  };

  if (isOwnTicket) {
    return (
      <div className="mt-4">
        <div className="w-full py-3 px-6 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 text-center font-semibold">
          Вы продаёте этот билет
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        className={`
          w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300
          ${disabled || loading || isPurchasing
            ? 'bg-gray-400 cursor-not-allowed opacity-60' 
            : 'bg-green-500 hover:bg-green-600 active:bg-green-700 cursor-pointer'
          }
          text-white
        `}
        onClick={handlePurchase}
        disabled={disabled || loading || isPurchasing}>
        {loading || isPurchasing ? 'Покупаем...' : `Купить за ${price} ₽`}
      </button>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PurchaseButton;
