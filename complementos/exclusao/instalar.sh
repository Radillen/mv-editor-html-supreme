#!/usr/bin/env bash
# Offline only. Never connects to Oracle or restarts Tomcat.
set -euo pipefail
export LC_ALL=C
JAR=mveditor-safe-report-delete-1.0.jar
CONFIG=safe-report-delete-context.xml
NATIVE=liberty-developer-core-1.0-SNAPSHOT.jar
fail() { printf 'NAO CONCLUIDO: %s\n' "$*" >&2; exit 1; }
for cmd in readlink sha256sum awk grep cp mv chmod date ps; do command -v "$cmd" >/dev/null || fail "Comando necessario ausente: $cmd"; done
HERE=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
[[ $# -ge 2 ]] || fail 'Uso: bash instalar.sh FORMS_ORIGINAL CATALINA_BASE [--apply | --rollback BACKUP]'
FORMS=$(readlink -f -- "$1") || fail 'Pasta forms invalida'
TOMCAT=$(readlink -f -- "$2") || fail 'Pasta Tomcat invalida'
WEB=$FORMS/WEB-INF
COMMON=$WEB/commonContext.xml
MODE=${3:---check}
[[ -d "$FORMS" && -f "$COMMON" && -d "$WEB/lib" ]] || fail 'Informe forms do editor ORIGINAL, com WEB-INF/commonContext.xml'
[[ -f "$TOMCAT/conf/server.xml" ]] || fail 'catalina.base sem conf/server.xml'
[[ ! -L "$COMMON" ]] || fail 'commonContext.xml e um link; revisar o destino'
hash() { sha256sum -- "$1" | awk '{print $1}'; }
check_payload() {
 (cd -- "$HERE" && sha256sum -c payload.sha256) || fail 'Pacote alterado ou incompleto'
}
check_stopped() {
 local processes
 processes=$(ps -eo args) || fail 'Nao foi possivel consultar processos'
 if awk -v base="-Dcatalina.base=$TOMCAT" '
 {b=0;t=0;for(i=1;i<=NF;i++){if($i==base)b=1;if($i=="org.apache.catalina.startup.Bootstrap")t=1;}if(b&&t)found=1;}
 END{exit found?0:1}' <<< "$processes"; then
  fail 'Tomcat ainda esta rodando. Pare somente essa instancia antes de instalar/reverter.'
 fi
}
check_payload
if [[ "$MODE" == --rollback ]]; then
 [[ $# == 4 ]] || fail '--rollback exige o caminho do backup'
 BACKUP=$(readlink -f -- "$4") || fail 'Backup invalido'
 [[ "$(dirname -- "$BACKUP")" == "$WEB" && "$(basename -- "$BACKUP")" == safe-report-delete-backup-* ]] || fail 'Backup deve pertencer a este WEB-INF'
 [[ -f "$BACKUP/commonContext.xml" && -f "$BACKUP/original.sha256" && -f "$BACKUP/installed.sha256" ]] || fail 'Backup incompleto'
 [[ "$(hash "$COMMON")" == "$(cat "$BACKUP/installed.sha256")" ]] || fail 'Contexto foi alterado depois da instalacao; revisar para preservar outras mudancas'
 [[ "$(hash "$BACKUP/commonContext.xml")" == "$(cat "$BACKUP/original.sha256")" ]] || fail 'Backup do contexto alterado'
 [[ -f "$WEB/lib/$JAR" && "$(hash "$WEB/lib/$JAR")" == "$(hash "$HERE/$JAR")" ]] || fail 'JAR instalado diferente; revisar'
 [[ -f "$WEB/$CONFIG" && "$(hash "$WEB/$CONFIG")" == "$(hash "$HERE/$CONFIG")" ]] || fail 'XML instalado diferente; revisar'
 check_stopped
 cp -p -- "$BACKUP/commonContext.xml" "$COMMON"
 rm -- "$WEB/lib/$JAR" "$WEB/$CONFIG"
 printf 'Extensao revertida. Inicie o Tomcat. Nenhum dado foi alterado no banco.\n'
 exit 0
fi
[[ "$MODE" == --check || "$MODE" == --apply ]] || fail 'Opcao invalida'
[[ $# -le 3 ]] || fail 'Argumentos excedentes'
EXPECTED=$(awk 'NR==1{print $1}' "$HERE/native-jar.sha256")
[[ -f "$WEB/lib/$NATIVE" && "$(hash "$WEB/lib/$NATIVE")" == "$EXPECTED" ]] || fail 'JAR original diferente do analisado. Nada foi instalado.'
if grep -Fq "$CONFIG" "$COMMON"; then
 [[ -f "$WEB/lib/$JAR" && "$(hash "$WEB/lib/$JAR")" == "$(hash "$HERE/$JAR")" && -f "$WEB/$CONFIG" && "$(hash "$WEB/$CONFIG")" == "$(hash "$HERE/$CONFIG")" ]] || fail 'Instalacao parcial/diferente; revisar'
 printf 'Extensao ja instalada; arquivos conferidos.\n'
 exit 0
fi
[[ ! -e "$WEB/lib/$JAR" && ! -e "$WEB/$CONFIG" ]] || fail 'Arquivos ja existem sem import; revisar'
# Only insert immediately before one root closing tag, without rewriting other XML.
CLOSINGS=$(awk '{sub(/\r$/,"");if($0~/^[[:space:]]*<\/beans>[[:space:]]*$/)n++}END{print n+0}' "$COMMON")
[[ "$CLOSINGS" == 1 ]] || fail 'Formato do contexto inesperado; nao foi alterado'
printf 'Compatibilidade conferida. Contexto: %s\n' "$COMMON"
if [[ "$MODE" == --check ]]; then
 printf 'Modo conferencia: nenhum arquivo alterado. Para aplicar, pare o Tomcat e use --apply.\n'
 exit 0
fi
check_stopped
BACKUP=$WEB/safe-report-delete-backup-$(date +%Y%m%d-%H%M%S)-$$
mkdir -- "$BACKUP"
cp -p -- "$COMMON" "$BACKUP/commonContext.xml"
hash "$COMMON" > "$BACKUP/original.sha256"
STAGED=$BACKUP/commonContext.new.xml
cp -p -- "$COMMON" "$STAGED"
awk -v config="$CONFIG" '{sub(/\r$/,"");if($0~/^[[:space:]]*<\/beans>[[:space:]]*$/)print "  <import resource=\"" config "\"/>";print}' "$COMMON" > "$STAGED"
hash "$STAGED" > "$BACKUP/installed.sha256"
INSTALLING=1
recover() {
 local result=$?
 if [[ "$result" != 0 && "$INSTALLING" == 1 ]]; then
  cp -p -- "$BACKUP/commonContext.xml" "$COMMON" || true
  rm -f -- "$WEB/lib/$JAR" "$WEB/$CONFIG"
  printf 'Falha ao instalar; contexto original restaurado. Confira antes de iniciar. Backup: %s\n' "$BACKUP" >&2
 fi
}
trap recover EXIT
cp -- "$HERE/$JAR" "$WEB/lib/$JAR"
cp -- "$HERE/$CONFIG" "$WEB/$CONFIG"
chmod 644 -- "$WEB/lib/$JAR" "$WEB/$CONFIG"
mv -- "$STAGED" "$COMMON"
INSTALLING=0
printf 'Instalacao preparada. Backup: %s\n' "$BACKUP"
printf 'Inicie o Tomcat e confira SAFE_REPORT_DELETE installed no mv-logs/mveditor.log.\n'
printf 'Nenhum dado foi alterado no banco durante a instalacao.\n'
