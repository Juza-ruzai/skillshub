import { useState, useCallback } from 'react'
import { Folder, FolderOpen, File } from 'lucide-react'

export interface FileTreeNode {
  name: string
  type: 'file' | 'directory'
  children?: FileTreeNode[]
}

export interface FileTreeProps {
  data: FileTreeNode[]
  onFileClick?: (path: string) => void
}

interface FileTreeItemProps {
  node: FileTreeNode
  path: string
  depth: number
  onFileClick?: (path: string) => void
  isClickable?: boolean
  highlightPattern?: string
}

function FileTreeItem({
  node,
  path,
  depth,
  onFileClick,
  isClickable,
  highlightPattern,
}: FileTreeItemProps): JSX.Element {
  // 默认只展开到二级目录（depth < 2），更深层级默认收起
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const currentPath = path ? `${path}/${node.name}` : node.name

  const handleClick = useCallback(() => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded)
    } else if (onFileClick) {
      onFileClick(currentPath)
    }
  }, [node.type, isExpanded, onFileClick, currentPath])

  const isDirectory = node.type === 'directory'
  const isClickableFile = !isDirectory && isClickable
  const isHighlighted =
    highlightPattern && node.name.toLowerCase().includes(highlightPattern.toLowerCase())

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg w-full text-left transition-all duration-150 ${isClickableFile ? 'hover:translate-x-1 cursor-pointer' : isDirectory ? 'cursor-pointer' : 'cursor-default'}`}
        style={{
          color: isHighlighted ? 'var(--accent-primary)' : 'var(--text-secondary)',
          background: isHighlighted ? 'rgba(59,130,246,0.1)' : 'transparent',
          fontWeight: isHighlighted ? 500 : 400,
        }}
        onMouseEnter={(e) => {
          if (isDirectory || isClickableFile) {
            e.currentTarget.style.background = 'rgba(59,130,246,0.08)'
            e.currentTarget.style.color = 'var(--accent-primary)'
          }
        }}
        onMouseLeave={(e) => {
          if (isHighlighted) {
            e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
            e.currentTarget.style.color = 'var(--accent-primary)'
          } else {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }
        }}
        aria-label={node.name}
        title={isClickableFile ? '点击预览' : isDirectory ? '点击展开/收起' : undefined}
      >
        {isDirectory ? (
          <>
            {isExpanded ? (
              <FolderOpen
                size={16}
                style={{ color: 'var(--accent-primary)' }}
                data-testid="folder-icon"
              />
            ) : (
              <Folder
                size={16}
                style={{ color: 'var(--accent-secondary)' }}
                data-testid="folder-icon"
              />
            )}
          </>
        ) : (
          <File
            size={16}
            style={{ color: isClickableFile ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
            data-testid="file-icon"
          />
        )}
        <span className="text-sm">{node.name}</span>
        {isClickableFile && <span className="ml-auto text-xs opacity-50">预览</span>}
      </button>

      {isDirectory && isExpanded && node.children && (
        <div className="ml-4 pl-2" style={{ borderLeft: '1px solid var(--card-border)' }}>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={`${child.name}-${index}`}
              node={child}
              path={currentPath}
              depth={depth + 1}
              onFileClick={onFileClick}
              isClickable={isClickable}
              highlightPattern={highlightPattern}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({
  data,
  onFileClick,
  clickableExtensions = ['.md', '.txt', '.json'],
  highlightPattern = 'SKILL.md',
}: FileTreeProps & {
  clickableExtensions?: string[]
  highlightPattern?: string
}): JSX.Element {
  const isFileClickable = (filename: string): boolean => {
    return clickableExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  return (
    <div className="font-mono">
      {data.map((node, index) => (
        <FileTreeItem
          key={`${node.name}-${index}`}
          node={node}
          path=""
          depth={0}
          onFileClick={onFileClick}
          isClickable={isFileClickable(node.name)}
          highlightPattern={highlightPattern}
        />
      ))}
    </div>
  )
}
