import idol from "@/assets/tpl-idol.jpg";
import casamento from "@/assets/tpl-casamento.jpg";
import quinze from "@/assets/tpl-15anos.jpg";
import safari from "@/assets/tpl-safari.jpg";
import idolVideo from "@/assets/tpl-idol-video.mp4.asset.json";

export const WHATSAPP = "5511999999999"; // TODO: número real
export const INSTAGRAM = "samaracriararts";

export type TextField = {
  key: string;
  label: string;
  value: string;
  x: number; // % da largura (centro)
  y: number; // % da altura (linha base central)
  size: number; // % da largura
  maxW: number; // % da largura
  font: string;
  weight?: number;
  color: string;
  stroke?: string;
  strokeW?: number;
  shadow?: string;
};

export type Invite = {
  id: string;
  name: string;
  category: "Infantil" | "Casamento" | "15 Anos";
  description: string;
  price: string;
  image: string;
  video?: string | undefined;
  fields: TextField[];
};

export const CATEGORIES = ["Infantil", "Casamento", "15 Anos"] as const;

export const invites: Invite[] = [
  {
    id: "idol-pop-animado",
    name: "Idol Pop Estrelinha (Animado)",
    category: "Infantil",
    description: "Convite animado com pétalas e brilhos em movimento. Ideal para festas temáticas pop.",
    price: "R$ 45,00",
    image: idol,
    video: idolVideo.url,
    fields: [
      { key: "nome", label: "Nome", value: "Micaela", x: 50, y: 52, size: 15, maxW: 84, font: "Fredoka", weight: 700, color: "#d6338a", stroke: "#ffffff", strokeW: 0.9, shadow: "rgba(140,40,160,0.5)" },
      { key: "idade", label: "Frase / idade", value: "faz 6 aninhos", x: 50, y: 61, size: 8, maxW: 80, font: "Great Vibes", color: "#7b3fc4", stroke: "#ffffff", strokeW: 0.5 },
      { key: "data", label: "Data", value: "Sáb, 5 de agosto", x: 18, y: 86.6, size: 3.4, maxW: 26, font: "Fredoka", weight: 600, color: "#6a2c9e" },
      { key: "hora", label: "Horário", value: "16h às 18h", x: 50, y: 86.6, size: 3.6, maxW: 26, font: "Fredoka", weight: 600, color: "#6a2c9e" },
      { key: "local", label: "Local", value: "Buffet Estrela", x: 82, y: 86.6, size: 3.4, maxW: 26, font: "Fredoka", weight: 600, color: "#6a2c9e" },
    ],
  },
  {
    id: "idol-pop",
    name: "Idol Pop Estrelinha",
    category: "Infantil",
    description: "Versão em imagem do convite Idol Pop, pronta para WhatsApp.",
    price: "R$ 25,00",
    image: idol,
    fields: [] as TextField[],
  },
  {
    id: "casamento-rosas",
    name: "Rosas & Eucalipto",
    category: "Casamento",
    description: "Aquarela delicada com moldura dourada. Elegância atemporal.",
    price: "R$ 35,00",
    image: casamento,
    fields: [
      { key: "intro", label: "Frase de abertura", value: "Com a bênção de Deus e de nossos pais", x: 50, y: 34, size: 3.2, maxW: 70, font: "Cormorant Garamond", weight: 500, color: "#6b6b5a" },
      { key: "noivos", label: "Nomes dos noivos", value: "Ana & Pedro", x: 50, y: 45, size: 12, maxW: 82, font: "Great Vibes", color: "#b08a3e" },
      { key: "convite", label: "Convite", value: "convidam para a celebração do seu casamento", x: 50, y: 53, size: 3.2, maxW: 70, font: "Cormorant Garamond", weight: 500, color: "#6b6b5a" },
      { key: "data", label: "Data", value: "12 DE SETEMBRO DE 2026", x: 50, y: 62, size: 4.4, maxW: 80, font: "Cinzel", weight: 600, color: "#4f5b4a" },
      { key: "hora", label: "Horário", value: "às 17 horas", x: 50, y: 67, size: 3.4, maxW: 70, font: "Cormorant Garamond", weight: 500, color: "#6b6b5a" },
      { key: "local", label: "Local", value: "Espaço Jardim das Flores", x: 50, y: 73, size: 3.6, maxW: 76, font: "Cormorant Garamond", weight: 600, color: "#4f5b4a" },
    ],
  },
  {
    id: "15-anos-coroa",
    name: "Coroa Dourada",
    category: "15 Anos",
    description: "Azul noite com coroa e brilhos dourados para uma debutante inesquecível.",
    price: "R$ 35,00",
    image: quinze,
    fields: [
      { key: "titulo", label: "Título", value: "MEUS 15 ANOS", x: 50, y: 30, size: 5, maxW: 80, font: "Cinzel", weight: 700, color: "#e8c77a" },
      { key: "nome", label: "Nome", value: "Valentina", x: 50, y: 44, size: 15, maxW: 86, font: "Great Vibes", color: "#f3d892", shadow: "rgba(255,210,120,0.6)" },
      { key: "data", label: "Data", value: "20 de março · 21h", x: 50, y: 56, size: 4.4, maxW: 80, font: "Cormorant Garamond", weight: 600, color: "#f5ead0" },
      { key: "local", label: "Local", value: "Salão Imperial", x: 50, y: 62, size: 4.4, maxW: 80, font: "Cormorant Garamond", weight: 600, color: "#f5ead0" },
    ],
  },
  {
    id: "safari-baby",
    name: "Safari Baby",
    category: "Infantil",
    description: "Bichinhos fofos da selva e balões coloridos.",
    price: "R$ 25,00",
    image: safari,
    fields: [
      { key: "nome", label: "Nome", value: "Theo", x: 50, y: 30, size: 17, maxW: 80, font: "Fredoka", weight: 700, color: "#e07a1f", stroke: "#ffffff", strokeW: 1 },
      { key: "idade", label: "Frase / idade", value: "1 aninho", x: 50, y: 39, size: 7, maxW: 70, font: "Fredoka", weight: 600, color: "#3f7d2a", stroke: "#ffffff", strokeW: 0.6 },
      { key: "data", label: "Data e horário", value: "Domingo, 10/05 · 15h", x: 50, y: 46, size: 4.2, maxW: 80, font: "Fredoka", weight: 500, color: "#365c26" },
      { key: "local", label: "Local", value: "Rua das Palmeiras, 123", x: 50, y: 51, size: 4, maxW: 80, font: "Fredoka", weight: 500, color: "#365c26" },
    ],
  },
];

// versão em imagem do idol reaproveita os campos do animado
invites[1]!.fields = invites[0]!.fields;

export const getInvite = (id: string) => invites.find((i) => i.id === id);

export const waLink = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
