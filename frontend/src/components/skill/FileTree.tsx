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
  onFileClick?: (path: string) => void
}

function FileTreeItem({ node, path, onFileClick }: FileTreeItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentPath = path ? `${path}/${node.name}` : node.name

  const handleClick = useCallback(() => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded)
    } else if (onFileClick) {
      onFileClick(currentPath)
    }
  }, [node.type, isExpanded, onFileClick, currentPath])

  const isDirectory = node.type === 'directory'

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg w-full text-left transition-all duration-150 hover:translate-x-1"
        style={{
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(59,130,246,0.08)'
          e.currentTarget.style.color = 'var(--accent-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
        aria-label={node.name}
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
          <File size={16} style={{ color: 'var(--text-tertiary)' }} data-testid="file-icon" />
        )}
        <span className="text-sm">{node.name}</span>
      </button>

      {isDirectory && isExpanded && node.children && (
        <div className="ml-4 pl-2" style={{ borderLeft: '1px solid var(--card-border)' }}>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={`${child.name}-${index}`}
              node={child}
              path={currentPath}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({ data, onFileClick }: FileTreeProps): JSX.Element {
  return (
    <div className="font-mono">
      {data.map((node, index) => (
        <FileTreeItem key={`${node.name}-${index}`} node={node} path="" onFileClick={onFileClick} />
      ))}
    </div>
  )
}
