#!/usr/bin/env bash
# Explicit page breaks only for mvPageBreaks=explicit-v1. No DB access/restart.
set -euo pipefail
export LC_ALL=C
umask 022
fail(){ printf 'NAO CONCLUIDO: %s\n' "$*" >&2; exit 1; }
HERE=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
[[ $# -ge 2 ]] || fail 'Uso: bash instalar.sh FORMS_ORIGINAL CATALINA_BASE [--apply | --rollback BACKUP]'
FORMS=$(readlink -f -- "$1"); TOMCAT=$(readlink -f -- "$2"); WEB=$FORMS/WEB-INF; MODE=${3:---check}
[[ -f "$WEB/lib/liberty-developer-core-1.0-SNAPSHOT.jar" && -f "$TOMCAT/conf/server.xml" ]] || fail 'Caminhos forms/Tomcat invalidos'
(cd -- "$HERE" && sha256sum -c payload.sha256) || fail 'Pacote alterado/incompleto'
hash(){ sha256sum -- "$1" | awk '{print $1}'; }
[[ $(hash "$WEB/lib/liberty-developer-core-1.0-SNAPSHOT.jar") == 947355f069a3d7a42f1cf20e994448d4e61a9d7e4b57704263fd652c8d79d708 ]] || fail 'JAR nativo diferente do analisado'
stopped(){ if ps -eo args | awk -v base="-Dcatalina.base=$TOMCAT" '{b=0;t=0;for(i=1;i<=NF;i++){if($i==base)b=1;if($i=="org.apache.catalina.startup.Bootstrap")t=1;}if(b&&t)f=1;}END{exit f?0:1}'; then fail 'Pare somente esta instancia Tomcat antes de instalar/reverter'; fi; }
mapfile -t FILES < <(cd "$HERE/classes" && find . -type f -name '*.class' | LC_ALL=C sort)
[[ ${#FILES[@]} -ge 2 ]] || fail 'Classes ausentes'
for f in "${FILES[@]}";do case "$f" in ./mv/editor/core/groovy/JasperParser.class|./local/mveditor/compat/PrintPages*.class) ;; *) fail 'Classe inesperada no pacote';; esac;done
if [[ $MODE == --rollback ]];then
 [[ $# == 4 ]] || fail 'Informe backup da instalacao'
 BACKUP=$(readlink -f -- "$4"); [[ $(dirname "$BACKUP") == "$WEB" && $(basename "$BACKUP") == print-pages-backup-* && -f "$BACKUP/installed" ]] || fail 'Backup invalido'
 for f in "${FILES[@]}";do [[ -f "$WEB/classes/$f" && $(hash "$WEB/classes/$f") == $(hash "$HERE/classes/$f") ]] || fail 'Classe alterada; reversao interrompida';done
 [[ -f "$FORMS/mveditor-page-breaks-version.txt" && $(hash "$FORMS/mveditor-page-breaks-version.txt") == $(hash "$HERE/mveditor-page-breaks-version.txt") ]] || fail 'Marcador alterado; reversao interrompida'
 stopped
 for f in "${FILES[@]}";do rm -- "$WEB/classes/$f";done
 rm -- "$FORMS/mveditor-page-breaks-version.txt"
 printf 'Complemento removido. Inicie o Tomcat. Nenhum dado no banco foi alterado.\n';exit 0
fi
[[ $MODE == --check || $MODE == --apply ]] || fail 'Opcao invalida'
[[ $# -le 3 ]] || fail 'Argumentos excedentes'
for f in "${FILES[@]}";do [[ ! -e "$WEB/classes/$f" && ! -L "$WEB/classes/$f" ]] || fail 'Ja existe uma das classes de sobreposicao; revisar antes de instalar';done
[[ ! -e "$FORMS/mveditor-page-breaks-version.txt" ]] || fail 'Marcador ja existe; revisar instalacao anterior'
printf 'Compatibilidade conferida: Java 7/Tomcat, JAR nativo esperado.\n'
[[ $MODE == --apply ]] || { printf 'Modo conferencia: nenhum arquivo alterado. Pare a instancia e use --apply para instalar.\n';exit 0; }
stopped
BACKUP="$WEB/print-pages-backup-$(date +%Y%m%d-%H%M%S)-$$";mkdir -- "$BACKUP"
cp -- "$HERE/payload.sha256" "$BACKUP/payload.sha256"
created=()
cleanup(){ code=$?;trap - ERR;for f in "${created[@]}";do rm -f -- "$f";done;printf 'Instalacao interrompida; classes copiadas nesta tentativa removidas.
' >&2;exit "$code"; }
trap cleanup ERR
mkdir -p -- "$WEB/classes"
CLASSES=$(readlink -f -- "$WEB/classes");[[ $CLASSES == "$WEB/classes" ]] || fail 'WEB-INF/classes aponta para outro destino'
for f in "${FILES[@]}";do
 dest="$WEB/classes/${f#./}";mkdir -p -- "$(dirname "$dest")"
 parent=$(readlink -f -- "$(dirname "$dest")");[[ $parent == "$CLASSES/"* ]] || fail 'Destino de classe fora de WEB-INF/classes'
 created+=("$dest");cp -- "$HERE/classes/$f" "$dest";chmod 644 -- "$dest"
done
created+=("$FORMS/mveditor-page-breaks-version.txt");cp -- "$HERE/mveditor-page-breaks-version.txt" "$FORMS/mveditor-page-breaks-version.txt";chmod 644 -- "$FORMS/mveditor-page-breaks-version.txt"
printf 'PRINT_PAGES_EXPLICIT_V1\n' > "$BACKUP/installed"
trap - ERR
printf 'Instalado. Backup de controle: %s\nInicie o Tomcat e confira /mveditor/mveditor-page-breaks-version.txt.\nNenhum JAR, contexto Spring ou dado do banco foi alterado.\n' "$BACKUP"
