
import React, { useRef, useEffect } from 'react';

declare global {
    interface Window {
        paypal: any;
    }
}

interface PaypalPlanButtonProps {
    planId: 'bronze' | 'silver' | 'gold';
    amount: string;
}

export const PaypalPlanButton: React.FC<PaypalPlanButtonProps> = ({ planId, amount }) => {
    const paypalButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (paypalButtonRef.current && window.paypal) {
            // To prevent re-rendering issues, clear the container first
            paypalButtonRef.current.innerHTML = '';

            window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color:  'blue',
                    shape:  'rect',
                    label:  'paypal'
                },
                createOrder: (data: any, actions: any) => {
                    return actions.order.create({
                        purchase_units: [{
                            description: `Subscription for ${planId} plan`,
                            amount: {
                                value: amount,
                                currency_code: 'USD'
                            }
                        }]
                    });
                },
                onApprove: async (data: any, actions: any) => {
                    try {
                        const capture = await actions.order.capture();
                        console.log('Payment successful!', capture);
                        // You can replace this with a more integrated success message inside the modal
                        alert('تم الدفع بنجاح! شكراً لك.'); 
                    } catch (error) {
                        console.error('Error capturing payment:', error);
                        alert('حدث خطأ أثناء تأكيد الدفع. يرجى المحاولة مرة أخرى.');
                    }
                },
                onError: (err: any) => {
                    console.error('PayPal Button Error:', err);
                    alert('حدث خطأ في زر الدفع. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.');
                },
                onCancel: (data: any) => {
                    console.log('Payment cancelled:', data);
                }
            }).render(paypalButtonRef.current);
        }
    }, [planId, amount]);

    return <div ref={paypalButtonRef} id="paypal-button-container-visible"></div>;
};
