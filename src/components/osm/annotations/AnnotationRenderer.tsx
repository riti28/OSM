import { memo, useEffect, useRef } from "react";
import { Arrow, Ellipse, Group, Line, Rect, Star, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { Annotation } from "@/types/osm/annotation";
import { denormalizePoints, denormalizeRect, normalizeRect, clamp } from "@/lib/osm/coordinates";
import { transformAnnotation } from "@/lib/osm/annotations/annotationFactory";

type Props = { annotation: Annotation; width: number; height: number; selected: boolean; selectable: boolean; erasable?: boolean;
  onSelect: (id: string | null) => void; onUpdate: (annotation: Annotation) => void; onComment: (annotation: Annotation) => void; onErase: (annotation: Annotation) => void; };
function AnnotationRenderer(p: Props) {
  const group = useRef<Konva.Group>(null), transformer = useRef<Konva.Transformer>(null);
  const a = p.annotation, size = { width: p.width, height: p.height }, b = denormalizeRect(a.bounds, size);
  const w = Math.max(b.width, 1), h = Math.max(b.height, 1);
  const isStamp = a.type === "tick" || a.type === "cross" || a.type === "stamp";
  const stampSize = Math.min(w, h), stampX = (w - stampSize) / 2, stampY = (h - stampSize) / 2;
  const stroke = Math.max(a.style.strokeWidth * p.width, 0.5);
  useEffect(() => {
    if (p.selected && group.current && transformer.current) {
      transformer.current.nodes([group.current]);
      transformer.current.getLayer()?.batchDraw();
    }
  }, [p.selected, p.width, p.height, a]);
  const lineProps = { stroke: a.style.color, strokeWidth: stroke, lineCap: "round" as const, lineJoin: "round" as const, hitStrokeWidth: Math.max(12, stroke) };
  function commit() {
    const node = group.current;
    if (!node) return;
    const next = normalizeRect({ x: node.x(), y: node.y(), width: b.width * node.scaleX(), height: b.height * node.scaleY() }, size);
    node.scale({ x: 1, y: 1 });
    p.onUpdate(transformAnnotation(a, next));
  }
  function choose(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    event.cancelBubble = true;
    if (p.erasable) p.onErase(a);
    else if (p.selectable) { p.onSelect(a.id); if (a.type === "comment") p.onComment(a); }
  }
  const points = "points" in a ? denormalizePoints(a.points, size).flatMap(point => [point.x - b.x, point.y - b.y]) : [];
  return <>
    <Group ref={group} id={a.id} name="annotation" x={b.x} y={b.y} width={w} height={h}
      opacity={a.style.opacity} draggable={p.selectable}
      dragBoundFunc={position => ({ x: clamp(position.x, 0, p.width - w), y: clamp(position.y, 0, p.height - h) })}
      onClick={choose} onTap={choose}
      onDblClick={event => { event.cancelBubble = true; if (p.selectable && a.type === "text") p.onComment(a); }}
      onDblTap={event => { event.cancelBubble = true; if (p.selectable && a.type === "text") p.onComment(a); }}
      onDragStart={() => p.onSelect(a.id)} onDragEnd={commit} onTransformEnd={commit}>
      <Rect width={w} height={h} fill="transparent" />
      {a.type === "tick" && <Line {...lineProps} points={[stampX + stampSize * 0.08, stampY + stampSize * 0.5,
        stampX + stampSize * 0.38, stampY + stampSize * 0.88, stampX + stampSize * 0.94, stampY + stampSize * 0.08]} />}
      {a.type === "cross" && <><Line {...lineProps} points={[stampX + stampSize * 0.1, stampY + stampSize * 0.1, stampX + stampSize * 0.9, stampY + stampSize * 0.9]} />
        <Line {...lineProps} points={[stampX + stampSize * 0.9, stampY + stampSize * 0.1, stampX + stampSize * 0.1, stampY + stampSize * 0.9]} /></>}
      {a.type === "circle" && <Ellipse x={w / 2} y={h / 2} radiusX={Math.max(0.5, w / 2 - stroke / 2)}
        radiusY={Math.max(0.5, h / 2 - stroke / 2)} {...lineProps} />}
      {a.type === "rectangle" && <Rect x={stroke / 2} y={stroke / 2} width={Math.max(0, w - stroke)} height={Math.max(0, h - stroke)} {...lineProps}/>}
      {a.type === "highlight" && <Rect width={w} height={h} fill={a.style.color} />}
      {(a.type === "pen" || a.type === "line") && <Line {...lineProps} tension={a.type === "pen" ? 0.15 : 0} points={points} />}
      {a.type === "arrow" && <Arrow {...lineProps} fill={a.style.color} points={points} pointerLength={Math.max(8, stroke * 4)} pointerWidth={Math.max(7, stroke * 3)}/>}
      {a.type === "text" && <Text text={a.text} width={w} height={h} fill={a.style.color} fontFamily="Arial"
        fontSize={(a.style.fontSize ?? 12 / 612) * p.width} lineHeight={1.3}
        fontStyle={[a.style.bold ? "bold" : "", a.style.italic ? "italic" : ""].filter(Boolean).join(" ") || "normal"}
        textDecoration={a.style.underline ? "underline" : ""}/>}
      {a.type === "stamp" && (a.variant === "star" ? <Star x={w / 2} y={h / 2} numPoints={5} innerRadius={Math.min(w, h) * 0.22}
        outerRadius={Math.min(w, h) * 0.47} {...lineProps}/> : <><Ellipse x={w / 2} y={h / 2} radiusX={Math.max(1, stampSize / 2 - stroke)}
          radiusY={Math.max(1, stampSize / 2 - stroke)} {...lineProps}/><Text text={a.text} width={w} height={h} align="center" verticalAlign="middle" fontSize={Math.min(w, h) * 0.62} fill={a.style.color}/></>)}
      {a.type === "comment" && <><Rect width={w} height={h} fill={a.style.color} cornerRadius={w * 0.18} />
        <Text text="≡" width={w} height={h} align="center" verticalAlign="middle" fill="white" fontSize={Math.min(w, h) * 0.8} /></>}
    </Group>
    {p.selected && p.selectable && <Transformer ref={transformer} rotateEnabled={false} flipEnabled={false}
      enabledAnchors={isStamp ? ["top-left", "top-right", "bottom-left", "bottom-right"] : undefined} keepRatio={true}
      resizeEnabled={a.type !== "pen" && a.type !== "comment" && b.width > 0 && b.height > 0} padding={4}
      borderStroke="#005dff" anchorStroke="#005dff" anchorFill="#ffffff" anchorSize={8}
      boundBoxFunc={(oldBox, nextBox) => nextBox.width < 8 || nextBox.height < 8 || nextBox.x < 0 || nextBox.y < 0 ||
        nextBox.x + nextBox.width > p.width || nextBox.y + nextBox.height > p.height ? oldBox : nextBox} />}
  </>;
}
export default memo(AnnotationRenderer);
