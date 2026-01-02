
import React, { useEffect, useRef, useState } from 'react';
// Fix: Use namespace import for d3 to ensure all modular members are accessible via the d3 object
import * as d3 from 'd3';
// Fix: Use named imports for THREE components to resolve namespace member access errors in the current TypeScript environment
import { 
  Scene, 
  PerspectiveCamera, 
  WebGLRenderer, 
  Group, 
  Color, 
  AmbientLight, 
  PointLight, 
  SphereGeometry, 
  MeshPhongMaterial, 
  Mesh, 
  RingGeometry, 
  MeshBasicMaterial, 
  DoubleSide, 
  CylinderGeometry 
} from 'three';
import { VizCommand } from '../types';

interface MathVisualizerProps {
  command: VizCommand | null;
}

const NeuralLaboratory: React.FC<MathVisualizerProps> = ({ command }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');

  // Fix: Reference three.js types directly from modular imports
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const objectsGroupRef = useRef<Group | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Fix: Instantiate Three.js classes directly
    const scene = new Scene();
    scene.background = new Color(0x020617);
    
    const camera = new PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const group = new Group();
    scene.add(group);
    objectsGroupRef.current = group;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (group) {
        group.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !sceneRef.current || !objectsGroupRef.current) return;
    // Fix: Access select via the d3 namespace
    const svg = d3.select(svgRef.current);
    const group = objectsGroupRef.current;
    
    // Clear previous
    svg.selectAll('*').remove();
    while(group.children.length > 0) {
      const obj = group.children[0] as any;
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      group.remove(obj);
    }

    if (!command || command.type === 'clear') {
      setMode('2d');
      return;
    }

    const width = 800;
    const height = 600;

    // --- PHYSICS ENGINE ---
    if (command.type === 'physics') {
      if (command.subType === 'solar_system') {
        setMode('3d');
        // Fix: Use modular Three.js classes
        const sunGeo = new SphereGeometry(2, 32, 32);
        const sunMat = new MeshPhongMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.5 });
        group.add(new Mesh(sunGeo, sunMat));

        const planets = [
          { dist: 4, size: 0.3, color: 0x94a3b8 }, // Mercury
          { dist: 6, size: 0.6, color: 0xf97316 }, // Venus
          { dist: 8, size: 0.65, color: 0x3b82f6 }, // Earth
          { dist: 10, size: 0.4, color: 0xef4444 }, // Mars
        ];

        planets.forEach(p => {
          // Fix: Use modular classes and constants
          const orbitGeo = new RingGeometry(p.dist - 0.05, p.dist + 0.05, 64);
          const orbitMat = new MeshBasicMaterial({ color: 0x1e293b, side: DoubleSide });
          const orbit = new Mesh(orbitGeo, orbitMat);
          orbit.rotation.x = Math.PI / 2;
          group.add(orbit);

          const planetGeo = new SphereGeometry(p.size, 16, 16);
          const planetMat = new MeshPhongMaterial({ color: p.color });
          const planet = new Mesh(planetGeo, planetMat);
          planet.position.x = p.dist;
          group.add(planet);
        });
      } else if (command.subType === 'pendulum') {
        setMode('2d');
        const g = svg.append('g').attr('transform', `translate(${width/2}, 50)`);
        const length = 400;
        
        const rod = g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', length).attr('stroke', '#64748b').attr('stroke-width', 4);
        const bob = g.append('circle').attr('r', 25).attr('fill', '#3b82f6').attr('cx', 0).attr('cy', length);

        let t = 0;
        const animate = () => {
          t += 0.05;
          const angle = Math.sin(t) * (Math.PI / 4);
          const x = Math.sin(angle) * length;
          const y = Math.cos(angle) * length;
          rod.attr('x2', x).attr('y2', y);
          bob.attr('cx', x).attr('cy', y);
          if (command.subType === 'pendulum') requestAnimationFrame(animate);
        };
        animate();
      } else if (command.subType === 'projectile') {
        setMode('2d');
        const g = svg.append('g').attr('transform', `translate(100, ${height - 100})`);
        const data = [];
        const v0 = 80;
        const angle = Math.PI / 4;
        for (let t = 0; t < 15; t += 0.2) {
          const x = v0 * Math.cos(angle) * t;
          const y = (v0 * Math.sin(angle) * t) - (0.5 * 9.8 * t * t);
          if (y < -50) break;
          data.push({ x, y: -y });
        }
        // Fix: Access line via d3 namespace
        const lineGen = d3.line<any>().x(d => d.x).y(d => d.y);
        g.append('path').datum(data).attr('d', lineGen).attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 3).attr('stroke-dasharray', '10,5');
      }
    }

    // --- CHEMISTRY ENGINE ---
    if (command.type === 'chemistry') {
      if (command.subType === 'molecule') {
        setMode('3d');
        const formula = command.data.toUpperCase();
        // Fix: Use modular classes
        const createAtom = (color: number, size: number, x: number, y: number, z: number) => {
          const mesh = new Mesh(
            new SphereGeometry(size, 32, 32),
            new MeshPhongMaterial({ color, shininess: 80 })
          );
          mesh.position.set(x, y, z);
          group.add(mesh);
        };

        if (formula === 'H2O') {
          createAtom(0xff0000, 0.8, 0, 0, 0); // O
          createAtom(0xffffff, 0.4, 1.2, 0.8, 0); // H
          createAtom(0xffffff, 0.4, -1.2, 0.8, 0); // H
        } else if (formula === 'CO2') {
          createAtom(0x333333, 0.9, 0, 0, 0); // C
          createAtom(0xff0000, 0.8, 2, 0, 0); // O
          createAtom(0xff0000, 0.8, -2, 0, 0); // O
        } else if (formula === 'NH3') {
          createAtom(0x0000ff, 0.9, 0, 0, 0); // N
          createAtom(0xffffff, 0.4, 1, 1, 1); // H
          createAtom(0xffffff, 0.4, -1, 1, 1); // H
          createAtom(0xffffff, 0.4, 0, 1, -1.4); // H
        }
      } else if (command.subType === 'periodic_table') {
        setMode('2d');
        const grid = svg.append('g').attr('transform', 'translate(50, 50)');
        const elements = ['H', '', '', '', '', '', '', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'];
        elements.forEach((el, i) => {
          if (!el) return;
          const x = (i % 8) * 80;
          const y = Math.floor(i / 8) * 80;
          const g = grid.append('g').attr('transform', `translate(${x}, ${y})`);
          g.append('rect').attr('width', 70).attr('height', 70).attr('rx', 12).attr('fill', '#1e293b').attr('stroke', '#334155');
          g.append('text').attr('x', 35).attr('y', 45).attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-weight', 'bold').text(el);
        });
      }
    }

    // --- BIOLOGY ENGINE ---
    if (command.type === 'biology') {
      if (command.subType === 'dna') {
        setMode('3d');
        for (let i = -10; i < 10; i++) {
          const y = i * 0.8;
          const angle = i * 0.5;
          const x1 = Math.cos(angle) * 2;
          const z1 = Math.sin(angle) * 2;
          const x2 = Math.cos(angle + Math.PI) * 2;
          const z2 = Math.sin(angle + Math.PI) * 2;
          createBioSphere(group, x1, y, z1, 0.2, 0x10b981);
          createBioSphere(group, x2, y, z2, 0.2, 0x3b82f6);
        }
      } else if (command.subType === 'cell' || command.subType === 'neuron') {
        setMode('3d');
        // Central Soma
        // Fix: Use modular classes
        const soma = new Mesh(
          new SphereGeometry(2, 32, 32),
          new MeshPhongMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.3 })
        );
        group.add(soma);
        // Dendrites
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          // Fix: Use modular classes
          const tube = new Mesh(
            new CylinderGeometry(0.1, 0.3, 6),
            new MeshPhongMaterial({ color: 0x6b21a8 })
          );
          tube.position.set(Math.cos(angle) * 3, Math.sin(angle) * 3, 0);
          tube.rotation.z = angle + Math.PI / 2;
          group.add(tube);
        }
      }
    }

  }, [command]);

  // Fix: Reference Group type directly
  function createBioSphere(group: Group, x: number, y: number, z: number, r: number, color: number) {
    // Fix: Use modular Three.js classes
    const mesh = new Mesh(new SphereGeometry(r, 16, 16), new MeshPhongMaterial({ color }));
    mesh.position.set(x, y, z);
    group.add(mesh);
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#020617] rounded-xl overflow-hidden shadow-inner math-grid group">
      <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${mode === '3d' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
      <svg ref={svgRef} viewBox="0 0 800 600" className={`relative w-full h-full touch-none z-20 ${mode === '3d' ? 'pointer-events-none opacity-20' : 'opacity-100'}`} />
      
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-30">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
            <div className={`h-2 w-2 rounded-full animate-pulse ${command?.type === 'physics' ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : command?.type === 'chemistry' ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
              Neural Simulation: {command?.subType?.replace('_', ' ') || 'Active'}
            </span>
        </div>
      </div>
    </div>
  );
};

export default NeuralLaboratory;
