const equiposBase = [
"ADT","Alianza Atlético","Alianza Lima","Atlético Grau",
"Cienciano","Comerciantes Unidos","Cusco FC",
"Deportivo Garcilaso","Deportivo Moquegua",
"FBC Melgar","UTC","Juan Pablo II","Los Chankas",
"Sport Boys","Sport Huancayo","Sporting Cristal",
"Universitario","Unión Comercio"
];

let datos = JSON.parse(localStorage.getItem("ligaSim")) || {
  apertura: crearEquipos(),
  clausura: crearEquipos()
};

function crearEquipos(){
  return equiposBase.map(nombre => ({
    nombre, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0
  }));
}

function generarPartidos(){
  const contenedor = document.getElementById("partidos");
  contenedor.innerHTML="";
  let modo = document.getElementById("modoSelect").value;
  if(modo==="acumulado") return;

  for(let i=0;i<equiposBase.length;i+=2){
    contenedor.innerHTML += `
      <div class="partido">
        <span>${equiposBase[i]}</span>
        <input type="number" min="0" id="g${i}">
        -
        <input type="number" min="0" id="g${i+1}">
        <span>${equiposBase[i+1]}</span>
      </div>
    `;
  }
}

function aplicarResultados(){
  let modo = document.getElementById("modoSelect").value;
  if(modo==="acumulado") return;

  datos[modo] = crearEquipos();

  for(let i=0;i<equiposBase.length;i+=2){
    let g1 = parseInt(document.getElementById("g"+i).value)||0;
    let g2 = parseInt(document.getElementById("g"+(i+1)).value)||0;

    actualizarEquipo(datos[modo][i], g1, g2);
    actualizarEquipo(datos[modo][i+1], g2, g1);
  }

  guardar();
  calcular();
}

function actualizarEquipo(e,gf,gc){
  e.PJ++;
  e.GF+=gf;
  e.GC+=gc;
  if(gf>gc) e.PG++;
  else if(gf===gc) e.PE++;
  else e.PP++;
}

function calcular(){
  let modo = document.getElementById("modoSelect").value;
  let tabla;

  if(modo==="acumulado"){
    tabla = datos.apertura.map((e,i)=> combinar(e, datos.clausura[i]));
  } else {
    tabla = datos[modo];
  }

  tabla.forEach(e=>{
    e.DG = e.GF - e.GC;
    e.PTS = e.PG*3 + e.PE;
  });

  tabla.sort((a,b)=>
    b.PTS - a.PTS ||
    b.DG - a.DG ||
    b.GF - a.GF
  );

  render(tabla);
}

function combinar(a,b){
  return {
    nombre:a.nombre,
    PJ:a.PJ+b.PJ,
    PG:a.PG+b.PG,
    PE:a.PE+b.PE,
    PP:a.PP+b.PP,
    GF:a.GF+b.GF,
    GC:a.GC+b.GC
  };
}

function render(tabla){
  const tbody=document.querySelector("#tabla tbody");
  tbody.innerHTML="";
  tabla.forEach((e,index)=>{
    let clase="";
    if(index<4) clase="libertadores";
    else if(index<8) clase="sudamericana";
    else if(index>=16) clase="descenso";

    tbody.innerHTML+=`
      <tr class="${clase}">
        <td>${index+1}</td>
        <td>${e.nombre}</td>
        <td>${e.PJ}</td>
        <td>${e.PG}</td>
        <td>${e.PE}</td>
        <td>${e.PP}</td>
        <td>${e.GF}</td>
        <td>${e.GC}</td>
        <td>${e.DG}</td>
        <td><strong>${e.PTS}</strong></td>
      </tr>
    `;
  });
}

function guardar(){
  localStorage.setItem("ligaSim", JSON.stringify(datos));
}

function resetTodo(){
  localStorage.removeItem("ligaSim");
  location.reload();
}

document.getElementById("modoSelect").addEventListener("change", ()=>{
  generarPartidos();
  calcular();
});

document.addEventListener("input", aplicarResultados);

generarPartidos();
calcular();
