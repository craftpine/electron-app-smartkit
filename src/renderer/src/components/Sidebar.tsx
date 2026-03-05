import { Archive, Bitcoin, Braces, Brackets, Code, DollarSign, FileCode, FileImage, Image, ImageIcon, PiIcon, Ruler, ShieldCheck, Shuffle, Wand2, Wind } from 'lucide-react'
import { Tool } from '../types/tool'
import ToolItem from './ToolItem'
import HtmlToJsx from './tools/HtmlToJsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, ScrollArea } from './ui'
import HtmlToPug from './tools/HtmlToPug'
import ImageConverter from './tools/ImageConverter'
import SvgToJsx from './tools/SvgToJsx'
import JsonToTypescript from './tools/JsonToTypescript'
import CssToTailwind from './tools/CssToTailwind'
import JavascriptToTypescript from './tools/JavascriptToTypescript'
import Base64Image from './tools/Base64Image'
import Base64Text from './tools/Base64Text'
import CertificateDecoder from './tools/CertificateDecoder'
import GzipEncoder from './tools/GzipEncoder'
import HtmlEncoder from './tools/HtmlEncoder'
import JwtDecoder from './tools/JwtDecoder'
import JwtEncoder from './tools/JwtEncoder'
import JwtValidator from './tools/JwtValidator'
import LoremIpsum from './tools/LoremIpsum'
import UuidGenerator from './tools/UuidGenerator'
import PasswordGenerator from './tools/PasswordGenerator'

type SidebarProps = {
  tools: Tool[]
  activeTool: string
  onSelectTool: (toolId: string) => void
}

export default function Sidebar({ tools, activeTool, onSelectTool }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-gray-900 font-bold text-lg">Dev Tools</h1>
        <p className="text-gray-500 text-xs mt-1">Utility Collection</p>
      </div>

      {/* Tools List */}
      <ScrollArea className="flex-1 flex flex-col">
        <div className="px-3 py-4 space-y-1">
          <Accordion type="multiple" className="w-full">
            {tools.map((tool) => {
              if (tool.children && tool.children.length > 0) {
                return (
                  <AccordionItem key={tool.id} value={tool.id} className="border-0">
                    <AccordionTrigger className="px-4 py-2 h-10 rounded-md hover:bg-gray-100 text-gray-700 font-normal">
                      <div className="flex items-center gap-3">
                        {tool.icon && <tool.icon className="w-4 h-4" />}
                        <span className="text-sm">{tool.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 py-1">
                      {tool.children.map((child) => (
                        <ToolItem
                          key={child.id}
                          tool={child}
                          isActive={activeTool === child.id}
                          onClick={() => onSelectTool(child.id)}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )
              } else {
                return (
                  <ToolItem
                    key={tool.id}
                    tool={tool}
                    isActive={activeTool === tool.id}
                    onClick={() => onSelectTool(tool.id)}
                  />
                )
              }
            })}
          </Accordion>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 text-gray-500 text-xs flex-shrink-0">
        <p>© 2024 Dev Tools</p>
      </div>
    </div>
  )
}

// Sample tools with icons
export const SAMPLE_TOOLS: Tool[] = [
  {
    id: 'converters',
    name: 'Converters',
    icon: Shuffle,
    component: () => <div className="p-4">Converters</div>,
    children: [
      {
        id: 'html-to-jsx',
        name: 'HTML to JSX',
        icon: Brackets,
        component: HtmlToJsx,
      },
      {
        id: 'html-to-pug',
        name: 'HTML to Pug',
        icon: PiIcon,
        component: HtmlToPug,
      },
      {
        id: 'money-converter',
        name: 'Money Converter',
        icon: DollarSign,
        component: () => <div className="p-4">Money Converter Tool</div>,
      },
      {
        id: 'unit-converter',
        name: 'Unit Converter',
        icon: Ruler,
        component: () => <div className="p-4">Unit Converter Tool</div>,
      },
      {
        id: 'crypto-converter',
        name: 'Crypto Converter',
        icon: Bitcoin,
        component: () => <div className="p-4">Crypto Converter Tool</div>,
      },
      {
        id: 'image-converter',
        name: 'Image Converter',
        icon: Image,
        component: ImageConverter,
      },
      {
        id: 'svg-converter',
        name: 'SVG to JSX',
        icon: ImageIcon,
        component: SvgToJsx,
      },
    ],
  },
  {
    id: 'transforms',
    name: 'Transforms',
    icon: Wand2,
    component: () => <div className="p-4">Transforms</div>,
    children: [
      {
        id: 'json-to-typescript',
        name: 'JSON to TypeScript',
        icon: Braces,
        component: JsonToTypescript,
      },
      {
        id: 'css-to-tailwind',
        name: 'CSS to Tailwind',
        icon: Wind,
        component: CssToTailwind,
      },
      {
        id: 'javascript-to-typescript',
        name: 'JavaScript to TypeScript',
        icon: FileCode,
        component: JavascriptToTypescript,
      },
    ],
  },
  {
    id: "encoders/decoders",
    name: "Encoders / Decoders",
    icon: Code,
    component: () => <div className="p-4">Encoders/Decoders</div>,
    children: [
      {
        id: 'base64-image',
        name: 'Base64 Image',
        icon: FileImage,
        component: Base64Image,
      },
      {
        id: 'base64-text',
        name: 'Base64 Text',
        icon: FileCode,
        component: Base64Text,
      },
      {
        id: 'html-encoder',
        name: 'HTML Encoder',
        icon: Code,
        component: HtmlEncoder,
      },
      {
        id: 'gzip-encoder',
        name: 'Gzip Encoder',
        icon: Archive,
        component: GzipEncoder,
      },
      {
        id: 'certificate-decoder',
        name: 'Certificate Decoder',
        icon: ShieldCheck,
        component: CertificateDecoder,
      },
      {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        icon: ShieldCheck,
        component: JwtDecoder,
      },
      {
        id: 'jwt-encoder',
        name: 'JWT Encoder',
        icon: ShieldCheck,
        component: JwtEncoder,
      },
      {
        id: 'jwt-validator',
        name: 'JWT Validator',
        icon: ShieldCheck,
        component: JwtValidator,
      }
    ]
  },
  {
    id: 'generators',
    name: 'Generators',
    icon: PiIcon,
    component: () => <div className="p-4">Generators</div>,
    children: [
      {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum',
        icon: Braces,
        component: LoremIpsum,
      },
      {
        id: 'uuid-generator',
        name: 'UUID Generator',
        icon: Braces,
        component: UuidGenerator,
      },
      {
        id: 'password-generator',
        name: 'Password Generator',
        icon: Braces,
        component: PasswordGenerator,
      }
    ]
  }
]
