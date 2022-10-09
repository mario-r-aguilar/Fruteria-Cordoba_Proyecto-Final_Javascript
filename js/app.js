//Declaro constantes y variables globales
const products = document.getElementById('products');
const items = document.getElementById('items');
const totalCarrito = document.getElementById('totalCarrito');
const stockCard = document.getElementById('stockCard').content;
const tempTotal = document.getElementById('tempTotal').content;
const tempCarrito = document.getElementById('tempCarrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};

//Obtengo datos del storage (en caso de que se actualizara la página por error mientras compraba)
document.addEventListener('DOMContentLoaded', () => {
	render();
	if (localStorage.getItem('carrito')) {
		carrito = JSON.parse(localStorage.getItem('carrito'));
		showCarrito();
	}
});

//Event Delegation
products.addEventListener('click', (e) => {
	addCarrito(e);
});

items.addEventListener('click', (e) => {
	btnSumRest(e);
});

//Obtengo los datos de los productos desde un archivo json, simulando consulta a una base de datos
const render = async () => {
	try {
		const resp = await fetch('./js/stock.json');
		const data = await resp.json();
		showCards(data);
	} catch (error) {
		console.log(error);
	}
};

// Renderizo los productos
const showCards = (data) => {
	data.forEach((product) => {
		stockCard.querySelector('h5').textContent = product.nombre;
		stockCard.querySelector('p').textContent = product.precio;
		stockCard.querySelector('img').setAttribute('src', product.img);
		stockCard.querySelector('.btn-dark').dataset.id = product.id;
		const clon = stockCard.cloneNode(true);
		fragment.appendChild(clon);
	});
	products.appendChild(fragment);
};

//Obtengo los datos del Event Delegation
const addCarrito = (e) => {
	if (e.target.classList.contains('btn-dark')) {
		setCarrito(e.target.parentElement);
	}
	e.stopPropagation();
};

// Cargo elementos agregados al carrito
const setCarrito = (element) => {
	const fruit = {
		id: element.querySelector('.btn-dark').dataset.id,
		nombre: element.querySelector('h5').textContent,
		precio: element.querySelector('p').textContent,
		cantidad: 1,
	};
	if (carrito.hasOwnProperty(fruit.id)) {
		fruit.cantidad = carrito[fruit.id].cantidad + 1;
	}
	carrito[fruit.id] = { ...fruit };
	showCarrito();
};

//Renderizo carrito
const showCarrito = () => {
	items.innerHTML = '';
	Object.values(carrito).forEach((product) => {
		tempCarrito.querySelector('th').textContent = product.id;
		tempCarrito.querySelectorAll('td')[0].textContent = product.nombre;
		tempCarrito.querySelectorAll('td')[1].textContent = product.cantidad;
		tempCarrito.querySelector('.btn-info').dataset.id = product.id;
		tempCarrito.querySelector('.btn-danger').dataset.id = product.id;
		tempCarrito.querySelector('span').textContent =
			product.cantidad * product.precio;

		const clon = tempCarrito.cloneNode(true);
		fragment.appendChild(clon);
	});
	items.appendChild(fragment);
	showTotal();
	localStorage.setItem('carrito', JSON.stringify(carrito));
};

// Muestro totales de cantidad y precio
const showTotal = () => {
	totalCarrito.innerHTML = '';
	if (Object.keys(carrito).length === 0) {
		totalCarrito.innerHTML = `
        <th scope="row" colspan="5">Aún no agrego ningún producto a su carrito</th>
        `;
		return;
	}
	const cantidadTotal = Object.values(carrito).reduce(
		(cont, { cantidad }) => cont + cantidad,
		0
	);
	const precioTotal = Object.values(carrito).reduce(
		(cont, { cantidad, precio }) => cont + cantidad * precio,
		0
	);
	tempTotal.querySelectorAll('td')[0].textContent = cantidadTotal;
	tempTotal.querySelector('span').textContent = precioTotal;

	const clon = tempTotal.cloneNode(true);
	fragment.appendChild(clon);
	totalCarrito.appendChild(fragment);

	// Agrego funcionalidad a los botones principales
	const vaciarCarrito = document.getElementById('vaciarCarrito');
	vaciarCarrito.addEventListener('click', () => {
		carrito = {};
		showCarrito();
	});

	const comprarCarrito = document.getElementById('comprarCarrito');
	comprarCarrito.addEventListener('click', () => {
		Swal.fire(
			'Muchas gracias por tu compra!',
			'A la brevedad recibirás tu pedido.',
			'info'
		);
		carrito = {};
		showCarrito();
	});
};

//Incorporo la funcionalidad de agregar y quitar productos desde el carrito
const btnSumRest = (e) => {
	if (e.target.classList.contains('btn-info')) {
		const cantProduct = carrito[e.target.dataset.id];
		cantProduct.cantidad++;
		carrito[e.target.dataset.id] = { ...cantProduct };
		showCarrito();
	}

	if (e.target.classList.contains('btn-danger')) {
		const cantProduct = carrito[e.target.dataset.id];
		cantProduct.cantidad--;
		if (cantProduct.cantidad === 0) {
			delete carrito[e.target.dataset.id];
		}
		showCarrito();
	}
	e.stopPropagation();
};
