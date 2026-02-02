import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import Modal from '@/components/ui/Modal';

const CheckoutForm = ({ clientSecret, onSuccess }: any) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!stripe || !elements) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else if (result.error) {
      alert(result.error.message);
    }
  };

  return (
    <>
      <CardElement />
      <button className="action-btn-accent mt-4" onClick={handlePay}>
        Confirmer le paiement
      </button>
    </>
  );
};

export default function StripePaymentModal({ clientSecret, onClose, onSuccess }: any) {
  return (
    <Modal isOpen onClose={onClose} title="Paiement Stripe">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} />
      </Elements>
    </Modal>
  );
}
