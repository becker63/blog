/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, createContext, useContext, Dispatch, SetStateAction, useEffect } from 'react'

interface settings {
  [key: string]: string
}

interface settingsContext {
  settingsValue: settings | null
  setSettingsValue: React.Dispatch<React.SetStateAction<settings | null>>
}

const settings = createContext<settingsContext | undefined>(undefined)

const isStrBool = (str: string) => {
  return str == 'true' || str == 'false'
}

const Key = ({ keyname, nested }: { keyname: string, nested?: boolean | undefined }) => {
  return (
    <div className="flex flex-row text-purple-400" style={{
      color: nested ?  "#ffd000" : "#A468C6"
    }}>
      <p className="text-blue-300">{'"'}</p>
      {keyname}
      <p className="text-blue-300">{'"'}</p>
    </div>
  )
}

const Value = ({ values, keyname }: { values: string[] | string; keyname: string }) => {
  const Settings = useContext(settings)
  const [selectedStr, setSelectedStr] = useState(values[0])

  useEffect(() => {
    Settings?.setSettingsValue({ ...Settings.settingsValue, [keyname]: selectedStr })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStr])

  const dropDownChildren =
    typeof values == 'string'
      ? (values as string)
      : values.map((child, i) => {
          return (
            <option
              key={i}
              className="bg-[#000000]"
              style={{
                color: isStrBool(child) ? '#ff8000' : '#33c113'
              }}
            >
              {child}
            </option>
          )
        })

  return (
    <div className="flex flex-row">
      <div
        className="flex flex-row bg-transparent text-[inherit] cursor-[inherit] leading-[inherit] border-[none] appearance-auto"
        style={{
          color: isStrBool(selectedStr) ? '#ff8000' : '#33c113'
        }}
      >
        {!isStrBool(selectedStr) && <p>{'"'}</p>}
        {typeof dropDownChildren != 'string' ? (
          <select
            className="bg-transparent text-[inherit] cursor-[inherit] leading-[inherit] border-[none] appearance-auto"
            style={{
              color: isStrBool(selectedStr) ? '#ff8000' : '#33c113'
            }}
            onChange={e => setSelectedStr(e.target.value)}
          >
            {dropDownChildren}
          </select>
        ) : (
          <p>{dropDownChildren}</p>
        )}
        {!isStrBool(selectedStr) && <p>{'"'}</p>}
      </div>
      <p className="text-blue-300">{','}</p>
    </div>
  )
}

const Line = ({ keyname, values, nested }: { keyname: string; values: string[] | string, nested?: boolean | undefined }) => {
  return (
    <div className="flex flex-row gap-2 my-[4px]">
      <Key keyname={keyname} nested={nested}/>
      <p>:</p>
      <Value keyname={keyname} values={values} />
    </div>
  )
}

const Comment = ({ content }: { content: string }) => {
  return (
    <div className="flex flex-row text-gray-600 gap-2">
      <p>{'//'}</p>
      {content}
    </div>
  )
}

const Object = ({ keyname, children }: { children: React.ReactNode; keyname: string }) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2">
        <Key keyname={keyname} />
        <p>:</p>
        <p>{'{'}</p>
      </div>
      <div className="ml-8 ">
        {children}
      </div>
      <p>{'}'}</p>
    </div>
  )
}

export const SettingsEditor = () => {
  const [settingsValue, setSettingsValue] = useState<settings | null>(null)

  useEffect(() => {
    console.log(settingsValue)
  }, [settingsValue])

  return (
    <settings.Provider value={{ settingsValue: settingsValue, setSettingsValue: setSettingsValue }}>
      <div className="text-3xl text-blue-300 overflow-scroll">
        <p>{'{'}</p>
        <div className="ml-8">
          <Comment content="to modify, click carrot values" />
          <Line keyname="workbench.statusBar.visibleworkbench.statusBar.visible" values={'crazy'} />
          <Line keyname="crazy" values={['wow', 'test', 'true']} />
          <Line keyname="bonkers" values={['wow', 'test', 'true']} />
          <Line keyname="another word" values={['wow', 'test', 'true']} />
          <Line keyname="insane" values={['wow', 'test', 'true']} />
          <Line keyname="shit face" values={['wow', 'test', 'true']} />
          <Line keyname="bad word" values={['wow', 'test', 'true']} />
          <Object keyname="maybe">
            <Line keyname="bad word" values={['wow', 'test', 'true']} nested={true}/>
            <Line keyname="bad word" values={'wow'} nested={true}/>
          </Object>
        </div>
        <p>{'}'}</p>
      </div>
    </settings.Provider>
  )
}
