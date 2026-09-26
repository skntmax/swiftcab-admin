'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { Info, Users } from 'lucide-react';

const NODE_W = 268;
const NODE_H = 76;
const PAD = 48;

const TYPE_STYLES = {
  user: { avatar: '#f97316', border: '#ea580c', label: 'User' },
  capability: { avatar: '#3b82f6', border: '#2563eb', label: 'Capability' },
  permission: { avatar: '#8b5cf6', border: '#7c3aed', label: 'Permission' },
  menu: { avatar: '#10b981', border: '#059669', label: 'Menu group' },
  subnav: { avatar: '#22c55e', border: '#16a34a', label: 'Sidebar tab' },
  override: { avatar: '#f59e0b', border: '#d97706', label: 'User override' },
  orphan: { avatar: '#94a3b8', border: '#64748b', label: 'Unmapped' },
};

function orgLinkPath(source, target) {
  const sx = source.x + PAD;
  const sy = source.y + PAD + NODE_H / 2;
  const tx = target.x + PAD;
  const ty = target.y + PAD - NODE_H / 2;
  const midY = sy + (ty - sy) / 2;
  return `M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`;
}

function buildD3Layout(tree) {
  const root = d3.hierarchy(tree, (d) => (Array.isArray(d.children) ? d.children : []));
  const treeLayout = d3
    .tree()
    .nodeSize([NODE_W + 28, NODE_H + 64])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.12));

  treeLayout(root);

  const nodes = root.descendants();
  const links = root.links();

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs, 0);
  const minY = Math.min(...ys, 0);
  const maxX = Math.max(...xs, 0);
  const maxY = Math.max(...ys, 0);
  const width = maxX - minX + NODE_W + PAD * 2;
  const height = maxY - minY + NODE_H + PAD * 2;

  return { nodes, links, width, height, minX, minY };
}

function OrgNodeCard({ node, selected, onSelect }) {
  const data = node.data;
  const style = TYPE_STYLES[data.type] || TYPE_STYLES.orphan;
  const initial = (data.name || '?').charAt(0).toUpperCase();
  const childCount = data.childCount ?? data.children?.length ?? 0;
  const blocked = data.effective === false;
  const visible = data.effective === true;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(data.id)}
      aria-label={`${style.label}: ${data.name}`}
      sx={{
        position: 'absolute',
        left: node.x + PAD - NODE_W / 2,
        top: node.y + PAD - NODE_H / 2,
        width: NODE_W,
        height: NODE_H,
        m: 0,
        p: 0,
        border: 'none',
        bgcolor: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          width: '100%',
          height: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: selected ? '#2563eb' : 'divider',
          boxShadow: selected ? '0 0 0 3px rgba(37,99,235,0.25)' : 1,
          bgcolor: blocked ? 'rgba(239,68,68,0.06)' : visible ? 'rgba(34,197,94,0.06)' : 'background.paper',
          overflow: 'hidden',
          transition: 'box-shadow 150ms ease, border-color 150ms ease',
          '&:hover': { boxShadow: 3 },
        }}
      >
        <Box
          sx={{
            width: 68,
            minWidth: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: style.avatar,
            color: '#fff',
            fontWeight: 800,
            fontSize: 22,
          }}
        >
          {initial}
        </Box>
        <Box sx={{ flex: 1, px: 1.25, py: 0.75, minWidth: 0, position: 'relative' }}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ pr: 2.5 }}>
            {data.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {data.subtitle || style.label}
          </Typography>
          {data.effective != null ? (
            <Chip
              size="small"
              label={data.effective ? 'Visible in sidebar' : 'Hidden by override'}
              color={data.effective ? 'success' : 'error'}
              variant="outlined"
              sx={{ mt: 0.35, height: 18, fontSize: 10, maxWidth: '100%' }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mt: 0.25 }}>
              {style.label}
              {data.type === 'user' && data.meta?.hasOverride ? ' · Gate 3 active' : ''}
            </Typography>
          )}
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Info size={11} aria-hidden="true" />
          </Box>
          {childCount > 0 ? (
            <Box
              sx={{
                position: 'absolute',
                bottom: 6,
                right: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.35,
                px: 0.75,
                py: 0.2,
                borderRadius: 999,
                bgcolor: 'rgba(59,130,246,0.12)',
                color: '#2563eb',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Users size={11} aria-hidden="true" />
              {String(childCount).padStart(2, '0')}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export default function UserPermissionHierarchyTree({ tree, errorMessage }) {
  const containerRef = useRef(null);
  const zoomSurfaceRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [zoomTransform, setZoomTransform] = useState(() => d3.zoomIdentity);

  const layout = useMemo(() => {
    if (!tree?.id) return null;
    try {
      return buildD3Layout(structuredClone(tree));
    } catch (err) {
      console.error('Hierarchy layout failed', err);
      return null;
    }
  }, [tree]);

  useEffect(() => {
    if (!layout || !containerRef.current) return;

    const { clientWidth, clientHeight } = containerRef.current;
    const scale = Math.min((clientWidth - 32) / layout.width, (clientHeight - 32) / layout.height, 1);
    const k = Math.max(0.35, scale);
    const tx = (clientWidth - layout.width * k) / 2 - layout.minX * k;
    const ty = 16 - layout.minY * k;
    setZoomTransform(d3.zoomIdentity.translate(tx, ty).scale(k));
  }, [layout]);

  useEffect(() => {
    const surface = zoomSurfaceRef.current;
    if (!surface || !layout) return;

    const selection = d3.select(surface);
    const zoom = d3
      .zoom()
      .scaleExtent([0.25, 2.5])
      .filter((event) => {
        if (event.type === 'wheel') return true;
        if (event.type.startsWith('touch')) return true;
        const target = event.target;
        return !(target instanceof Element && target.closest('button'));
      })
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
      });

    selection.call(zoom);

    return () => {
      selection.on('.zoom', null);
    };
  }, [layout]);

  if (errorMessage) {
    return (
      <Typography variant="body2" color="error.main" sx={{ py: 4, textAlign: 'center' }}>
        {errorMessage}
      </Typography>
    );
  }

  if (!tree?.id) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        Select a user to render the permission hierarchy.
      </Typography>
    );
  }

  if (!layout) {
    return (
      <Typography variant="body2" color="error.main" sx={{ py: 4, textAlign: 'center' }}>
        Could not layout hierarchy for this user.
      </Typography>
    );
  }

  const layerTransform = `translate(${zoomTransform.x}px, ${zoomTransform.y}px) scale(${zoomTransform.k})`;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {Object.entries(TYPE_STYLES).map(([key, style]) => (
          <Stack key={key} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: style.avatar }} />
            <Typography variant="caption" color="text.secondary">
              {style.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box
        ref={containerRef}
        sx={{
          height: { xs: 420, md: 560 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'rgba(248,250,252,0.6)',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'grab',
          touchAction: 'none',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <svg
          ref={zoomSurfaceRef}
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0, zIndex: 0, cursor: 'grab' }}
          role="presentation"
        >
          <rect width="100%" height="100%" fill="transparent" />
        </svg>

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: layout.width,
            height: layout.height,
            transform: layerTransform,
            transformOrigin: '0 0',
            willChange: 'transform',
            zIndex: 1,
            pointerEvents: 'none',
            '& button': { pointerEvents: 'auto' },
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {layout.links.map((link) => (
              <path
                key={`${link.source.data.id}-${link.target.data.id}`}
                d={orgLinkPath(link.source, link.target)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                opacity={0.75}
              />
            ))}
          </svg>

          {layout.nodes.map((node) => (
            <OrgNodeCard
              key={node.data.id}
              node={node}
              selected={selectedId === node.data.id}
              onSelect={setSelectedId}
            />
          ))}
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Scroll to zoom · drag canvas to pan · {layout.nodes.length} nodes · User → Capability → Permission → Menu → Sub-nav
      </Typography>
    </Stack>
  );
}
