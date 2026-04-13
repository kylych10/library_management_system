import React from "react"
import { Card, CardContent } from "@mui/material"


const StatsCard = ({ icon, value, title, subtitle, bgColor, textColor }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow" sx={{ overflow: "hidden", minWidth: 0 }}>
      <CardContent sx={{ p: { xs: "12px !important", sm: "16px !important" } }}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 sm:p-3 rounded-lg ${bgColor}`}>
            {icon}
          </div>

          <span className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
            {value}
          </span>
        </div>

        <p className="text-sm sm:text-base text-gray-700 font-semibold mb-0.5">
          {title}
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}

export default StatsCard
