const prices = {
    materials: {
        gold: 2000,
        silver: 500,
        roseGold: 1800
    },
    stones: {
        ruby: 1500,
        diamond: 5000,
        yellowDiamond: 3500
    }
};

let selectedMaterial = 'gold';
let selectedStone = 'diamond';

function updatePrice() {
    const materialPrice = prices.materials[selectedMaterial];
    const stonePrice = prices.stones[selectedStone];
    const totalPrice = materialPrice + stonePrice;
    document.getElementById('price-display').innerText = `Prix: €${totalPrice.toFixed(2)}`;
}

document.getElementById('ruby').addEventListener('click', () => {
    selectedStone = 'ruby';
    updatePrice();
});

document.getElementById('diamond').addEventListener('click', () => {
    selectedStone = 'diamond';
    updatePrice();
});

document.getElementById('yellowDiamond').addEventListener('click', () => {
    selectedStone = 'yellowDiamond';
    updatePrice();
});

document.getElementById('gold').addEventListener('click', () => {
    selectedMaterial = 'gold';
    updatePrice();
});

document.getElementById('silver').addEventListener('click', () => {
    selectedMaterial = 'silver';
    updatePrice();
});

document.getElementById('roseGold').addEventListener('click', () => {
    selectedMaterial = 'roseGold';
    updatePrice();
});

updatePrice();