
// @ts-nocheck
export async function startPaypalCheckout(planId: 'lite' | 'plus' | 'pro', amount: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!window.paypal) {
            console.error("PayPal SDK not loaded.");
            alert("حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.");
            return reject(new Error("PayPal SDK not loaded."));
        }

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        const cleanup = () => {
            if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
            }
        };

        try {
            window.paypal.Buttons({
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            description: `Prompt Master - ${planId.toUpperCase()} plan`,
                            amount: {
                                value: amount,
                                currency_code: 'USD'
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        console.log('Transaction completed by ' + details.payer.name.given_name);
                        console.log('Order Details:', details);
                        alert('تم الدفع بنجاح! سيتم تفعيل اشتراكك قريباً.');
                        cleanup();
                        resolve();
                    });
                },
                onError: function(err) {
                    console.error('PayPal Checkout Error:', err);
                    alert('حدث خطأ أثناء الدفع. يرجى المحاولة مرة أخرى.');
                    cleanup();
                    reject(err);
                },
                onCancel: function(data) {
                    console.log('PayPal Checkout Canceled:', data);
                    alert('تم إلغاء عملية الدفع.');
                    cleanup();
                    resolve(); 
                }
            }).render(tempDiv).then(() => {
                const button = tempDiv.querySelector('div[role="button"]');
                if (button) {
                   
                    const clickInterval = setInterval(() => {
                        const btn = tempDiv.querySelector('div[role="button"]');
                        if(btn){
                            (btn as HTMLElement).click();
                            clearInterval(clickInterval);
                        }
                    }, 100);

                } else {
                    console.error("PayPal button failed to render in the temporary container.");
                    alert("حدث خطأ غير متوقع. لا يمكن بدء عملية الدفع.");
                    cleanup();
                    reject(new Error("PayPal button not found."));
                }
            }).catch(err => {
                 console.error('Error rendering paypal button', err)
                 cleanup();
                 reject(err)
            });

        } catch (error) {
            console.error("An unexpected error occurred during PayPal setup:", error);
            alert("حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.");
            cleanup();
            reject(error);
        }
    });
}
