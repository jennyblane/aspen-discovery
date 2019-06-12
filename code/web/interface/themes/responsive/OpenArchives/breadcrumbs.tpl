{if $lastSearch}
&nbsp;<a href="{$lastSearch|escape}#record{$id|escape:"url"}">{translate text="Return to Search Results"}</a> <span class="divider">&raquo;</span>
{/if}
{if $breadcrumbText}
    <em>{$breadcrumbText|truncate:30:"..."|escape}</em> <span class="divider">&raquo;</span>
{/if}
{if !empty($recordCount)}
    {translate text="Showing"}
    {$recordStart} - {$recordEnd}
    {translate text='of'} {$recordCount|number_format}
{/if}