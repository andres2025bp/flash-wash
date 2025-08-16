const STORAGE_KEY = 'registrosLavado';
let registros = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let estadisticasChart;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
  mostrarRegistros();
  actualizarGrafico('lavadores');

  document.getElementById('registroForm').addEventListener('submit', e => {
    e.preventDefault();
    agregarRegistro();
  });

  document.getElementById('tipoGrafico').addEventListener('change', function() {
    actualizarGrafico(this.value);
  });

  document.getElementById('limpiarRegistros').addEventListener('click', () => {
    if(confirm('¿Seguro que deseas eliminar TODOS los registros?')) limpiarRegistros();
  });
});

function guardarRegistros() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

function agregarRegistro() {
  const form = document.getElementById('registroForm');
  const nuevo = {
    id: Date.now(),
    lavador: form.lavador.value,
    codigo: form.codigo.value,
    precio: parseInt(form.precio.value),
    cancelado: parseInt(form.cancelado.value),
    fecha: form.fecha.value,
    hora: form.hora.value,
    fechaRegistro: new Date().toISOString()
  };
  registros.push(nuevo);
  guardarRegistros();
  mostrarRegistros();
  actualizarGrafico(document.getElementById('tipoGrafico').value);
  form.reset();
  document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
  alert('Servicio registrado exitosamente');
}

function limpiarRegistros() {
  registros = [];
  guardarRegistros();
  mostrarRegistros();
  actualizarGrafico(document.getElementById('tipoGrafico').value);
  alert('Todos los registros fueron eliminados');
}

function eliminarRegistro(id) {
  if(confirm('¿Seguro que deseas eliminar este registro?')) {
    registros = registros.filter(r => r.id !== id);
    guardarRegistros();
    mostrarRegistros();
    actualizarGrafico(document.getElementById('tipoGrafico').value);
  }
}

function mostrarRegistros() {
  const body = document.getElementById('registrosBody');
  body.innerHTML = '';
  [...registros].sort((a,b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .forEach(r => {
      const diff = r.precio - r.cancelado;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.lavador}</td>
        <td>${r.codigo}</td>
        <td>${r.precio.toLocaleString()}</td>
        <td>${r.cancelado.toLocaleString()}</td>
        <td>${r.fecha} ${r.hora}</td>
        <td style="color:${diff>0?'red':'green'}">${diff.toLocaleString()}</td>
        <td><button onclick="eliminarRegistro(${r.id})" class="text-red-600 hover:text-red-800">Eliminar</button></td>
      `;
      body.appendChild(row);
    });
}

function actualizarGrafico(tipo) {
  const ctx = document.getElementById('estadisticasChart').getContext('2d');
  if (estadisticasChart) estadisticasChart.destroy();

  let labels = [], dataset = [], dataset2, titulo = '', colors;

  if (tipo === 'lavadores') {
    const count = {};
    registros.forEach(r => count[r.lavador] = (count[r.lavador] || 0) + 1);
    labels = Object.keys(count);
    dataset = Object.values(count);
    titulo = 'Servicios por Lavador';
    colors = 'rgba(59,130,246,0.6)';
  } 
  else if (tipo === 'precios') {
    const ranges = {'<15K':0,'15K-20K':0,'20K-25K':0,'25K-30K':0,'>30K':0};
    registros.forEach(r => {
      if(r.precio<15000) ranges['<15K']++;
      else if(r.precio<20000) ranges['15K-20K']++;
      else if(r.precio<25000) ranges['20K-25K']++;
      else if(r.precio<30000) ranges['25K-30K']++;
      else ranges['>30K']++;
    });
    labels = Object.keys(ranges);
    dataset = Object.values(ranges);
    titulo = 'Distribución de Precios';
    colors = 'rgba(16,185,129,0.6)';
  } 
  else if (tipo === 'cancelado_vs_precio') {
    const lavadores = [...new Set(registros.map(r=>r.lavador))];
    labels = lavadores;
    const promedios = {};
    lavadores.forEach(l => {
      const servicios = registros.filter(r=>r.lavador===l);
      promedios[l] = {
        precio: Math.round(servicios.reduce((s,x)=>s+x.precio,0)/servicios.length),
        cancelado: Math.round(servicios.reduce((s,x)=>s+x.cancelado,0)/servicios.length)
      };
    });
    dataset = lavadores.map(l => promedios[l].precio);
    dataset2 = lavadores.map(l => promedios[l].cancelado);
    titulo = 'Precio vs Cancelado';
    colors = ['rgba(59,130,246,0.6)','rgba(245,158,11,0.6)'];
  } 
  else if (tipo === 'horas') {
    const horas = {};
    for(let i=8;i<=20;i++) horas[`${i}:00-${i+1}:00`] = 0;
    registros.forEach(r => {
      const h = parseInt(r.hora.split(':')[0]);
      if(horas[`${h}:00-${h+1}:00`]!==undefined) horas[`${h}:00-${h+1}:00`]++;
    });
    labels = Object.keys(horas);
    dataset = Object.values(horas);
    titulo = 'Servicios por Hora';
    colors = 'rgba(124,58,237,0.6)';
  }

  const config = tipo === 'cancelado_vs_precio'
    ? {
      type:'bar',
      data:{labels,datasets:[
        {label:'Precio',data:dataset,backgroundColor:colors[0]},
        {label:'Cancelado',data:dataset2,backgroundColor:colors[1]}
      ]},
      options:{responsive:true,plugins:{title:{display:true,text:titulo}}}
    }
    : {
      type:'bar',
      data:{labels,datasets:[{label:titulo,data:dataset,backgroundColor:colors}]},
      options:{responsive:true,plugins:{title:{display:true,text:titulo}},scales:{y:{beginAtZero:true}}}
    };

  estadisticasChart = new Chart(ctx, config);
}
