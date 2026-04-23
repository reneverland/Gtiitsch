import React, { useState, useEffect } from 'react'
import {
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  getSchoolsByDistrict
} from '../data/schools'
import styles from './SchoolSelector.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
}

const SchoolSelector: React.FC<Props> = ({ value, onChange }) => {
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [school, setSchool] = useState('')
  const [isManualInput, setIsManualInput] = useState(false)
  
  const [cities, setCities] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [schools, setSchools] = useState<string[]>([])

  // 如果有初始值，设置为手动输入模式
  useEffect(() => {
    if (value && !school) {
      setSchool(value)
      setIsManualInput(true)
    }
  }, [value])

  // 当省份改变时，更新城市列表
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvince = e.target.value
    setProvince(selectedProvince)
    setCity('')
    setDistrict('')
    setSchool('')
    
    if (selectedProvince) {
      const cityList = getCitiesByProvince(selectedProvince)
      setCities(cityList)
      setDistricts([])
      setSchools([])
    } else {
      setCities([])
      setDistricts([])
      setSchools([])
    }
  }

  // 当城市改变时，更新区县列表
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value
    setCity(selectedCity)
    setDistrict('')
    setSchool('')
    
    if (selectedCity && province) {
      const districtList = getDistrictsByCity(province, selectedCity)
      setDistricts(districtList)
      setSchools([])
    } else {
      setDistricts([])
      setSchools([])
    }
  }

  // 当区县改变时，更新学校列表
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrict = e.target.value
    setDistrict(selectedDistrict)
    setSchool('')
    
    if (selectedDistrict && city && province) {
      const schoolList = getSchoolsByDistrict(province, city, selectedDistrict)
      setSchools(schoolList)
    } else {
      setSchools([])
    }
  }

  // 当学校改变时，更新父组件
  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchool = e.target.value
    setSchool(selectedSchool)
    onChange(selectedSchool)
  }

  // 手动输入学校名称
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schoolName = e.target.value
    setSchool(schoolName)
    onChange(schoolName)
  }

  // 切换输入模式
  const toggleInputMode = () => {
    setIsManualInput(!isManualInput)
    if (!isManualInput) {
      // 切换到手动输入时，清空选择
      setProvince('')
      setCity('')
      setDistrict('')
      setCities([])
      setDistricts([])
      setSchools([])
    } else {
      // 切换到级联选择时，清空手动输入
      setSchool('')
      onChange('')
    }
  }

  if (isManualInput) {
    return (
      <div>
        <div className={styles.manualInput}>
          <label className={styles.manualInputLabel}>
            高中学校名称<span className="required">*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={school}
            onChange={handleManualInput}
            placeholder="请输入您就读的高中学校全称"
          />
          <div className={styles.note}>
            请输入完整的学校名称，如：深圳中学
          </div>
        </div>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={toggleInputMode}
        >
          📍 切换到列表选择
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.selectWrapper}>
          <label className={styles.label}>
            省份<span className="required">*</span>
          </label>
          <select
            className={styles.select}
            value={province}
            onChange={handleProvinceChange}
          >
            <option value="">请选择省份</option>
            {getProvinces().map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <label className={styles.label}>
            城市<span className="required">*</span>
          </label>
          <select
            className={styles.select}
            value={city}
            onChange={handleCityChange}
            disabled={!province}
          >
            <option value="">请选择城市</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <label className={styles.label}>
            区县<span className="required">*</span>
          </label>
          <select
            className={styles.select}
            value={district}
            onChange={handleDistrictChange}
            disabled={!city}
          >
            <option value="">请选择区县</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <label className={styles.label}>
            学校<span className="required">*</span>
          </label>
          <select
            className={styles.select}
            value={school}
            onChange={handleSchoolChange}
            disabled={!district}
          >
            <option value="">请选择学校</option>
            {schools.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.note} style={{ marginTop: '12px' }}>
        💡 如果列表中没有您的学校，请点击下方按钮手动输入
      </div>
      
      <button
        type="button"
        className={styles.toggleButton}
        onClick={toggleInputMode}
      >
        ✏️ 手动输入学校名称
      </button>
    </div>
  )
}

export default SchoolSelector


