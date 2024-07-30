#!/bin/bash
set -eu

# 输入文件名
input_file="${CONFIG_SOURCE}"
# 输出文件名
output_file="/app/appsettings.json"

# 检查输入文件是否存在
if [ -f "${input_file}" ]; then
   awk '{
       while (match($0, /\$\{[A-Za-z_][A-Za-z0-9_]*\}/)) {
           var=substr($0, RSTART+2, RLENGTH-3)
           gsub(/\$\{[A-Za-z_][A-Za-z0-9_]*\}/, ENVIRON[var])
       }
       print
   }' "$input_file" >"$output_file"
   echo "配置文件已生成"
else
   echo "使用默认配置文件"
fi

exec "$@"