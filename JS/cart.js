document.addEventListener("DOMContentLoaded", function () {
    const cartIcon = document.getElementById("cart-icon");
    const cartModal = document.getElementById("cart-modal");
    const closeCart = document.getElementById("close-cart");
    const cartItemsContainer = document.querySelector("#cart-items tbody");

    const cartCountElement = document.getElementById("cart-count");
    const checkoutBtn = document.getElementById("checkout-btn");
    const fullNameInput = document.getElementById("full-name");
    const phoneInput = document.getElementById("phone-number");

    // Создание контейнера для уведомлений (если его нет)
    if (!document.getElementById("notification-container")) {
        const notificationContainer = document.createElement("div");
        notificationContainer.id = "notification-container";
        document.body.appendChild(notificationContainer);
    }

    // Открытие корзины
    cartIcon.addEventListener("click", () => {
        cartModal.classList.add("show");
        updateCartDisplay();
        fullNameInput.value = "";
        phoneInput.value = "";
    });

    // Закрытие корзины
    closeCart.addEventListener("click", () => {
        cartModal.classList.remove("show");
    });

    // Закрытие при клике вне корзины
    window.addEventListener("click", (event) => {
        if (event.target === cartModal) {
            cartModal.classList.remove("show");
        }
    });

    // Функция отображения всплывающего уведомления
    function showNotification(message) {
        const notificationContainer = document.getElementById("notification-container");
        const notification = document.createElement("div");
        notification.classList.add("notification");
        notification.textContent = message;

        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("hide");
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Функция обновления отображения корзины
    function updateCartDisplay() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.name}</td>
                <td>₽${item.price}</td>
                <td>
                    <button class="decrease-qty" data-id="${item.id}">−</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="increase-qty" data-id="${item.id}">+</button>
                </td>
                <td>₽${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-item" data-id="${item.id}">Удалить</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });
        


        cartCountElement.textContent = totalItems;
    }

    // Добавление товара в корзину
    window.addProductToCart = function (id, name, price) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productIndex = cart.findIndex(item => item.id === id);

        if (productIndex >= 0) {
            cart[productIndex].quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
        showNotification(`${name} добавлен в корзину!`);
    };

    // Изменение количества товара
    cartItemsContainer.addEventListener("click", (e) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productId = e.target.dataset.id;
        const product = cart.find(item => item.id === productId);

        if (e.target.classList.contains("increase-qty") && product) {
            product.quantity += 1;
        } 
        if (e.target.classList.contains("decrease-qty") && product) {
            product.quantity = Math.max(1, product.quantity - 1);
        }
        if (e.target.classList.contains("remove-item")) {
            cart = cart.filter(item => item.id !== productId);
            showNotification("Товар удален из корзины");
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    });

    // Маска для телефона
    phoneInput.addEventListener("input", function () {
        let value = phoneInput.value.replace(/\D/g, "");
        if (value.length > 11) value = value.substring(0, 11);

        let formattedValue = "+7 ";
        if (value.length > 1) formattedValue += `(${value.substring(1, 4)}`;
        if (value.length >= 4) formattedValue += `) ${value.substring(4, 7)}`;
        if (value.length >= 7) formattedValue += `-${value.substring(7, 9)}`;
        if (value.length >= 9) formattedValue += `-${value.substring(9, 11)}`;

        phoneInput.value = formattedValue;
    });

    // Проверка перед оформлением заказа
    checkoutBtn.addEventListener("click", function (event) {
        const fullName = fullNameInput.value.trim();
        const phoneNumber = phoneInput.value.trim();
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (!fullName) {
            alert("Пожалуйста, введите ФИО.");
            event.preventDefault();
            return;
        }

        if (!phoneNumber.match(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/)) {
            alert("Введите корректный номер телефона.");
            event.preventDefault();
            return;
        }

        if (cart.length === 0) {
            alert("Ваша корзина пуста.");
            event.preventDefault();
            return;
        }

        alert("Заказ оформлен! Ожидайте звонка оператора.");
        
        // Очистка корзины после оформления
        localStorage.removeItem("cart");
        updateCartDisplay();
    });

    // Обновление счетчика при загрузке страницы
    updateCartDisplay();
});
